import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CONNECTION } from 'src/common/constants';
import { I18nService, I18nValidationError } from 'nestjs-i18n';
import { Between, DataSource, Like, Raw, Repository } from 'typeorm';
import { Lot } from '../lot/entities/lot.entity';
import { ItemSerial } from '../item-serial/entities/item-serial.entity';
import { InventoryItem } from '../inventory-item/entities/inventory-item.entity';
import { Transaction } from './entities/transaction.entity';
import { TransactionItem } from '../transaction-item/entities/transaction-item.entity';
import { TransactionB2cOrder } from '../transaction-b2c-order/entities/transaction-b2c-order.entity';
import { TransactionZone } from '../transaction-zone/entities/transaction-zone.entity';
import { TransactionGroup } from '../transaction-group/entities/transaction-group.entity';
import { LotService } from '../lot/lot.service';
import { ItemService } from '../item/item.service';
import { Category, InputType, SlipStatus, StockStatus } from '../enum';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FindTransactionDto } from './dto/find-transaction.dto';
import { InstructShippingTransactionDto } from './dto/instruct-shipping-transaction.dto';
import { CreateTransactionItemDto } from '../transaction-item/dto/create-transaction-item.dto';
import { CreateLotDto } from '../lot/dto/create-lot.dto';
import { CreateTransactionZoneDto } from '../transaction-zone/dto/create-transaction-zone.dto';
import { IndexedCollectionItemDto } from '../inventory-item/dto/index-collection-item.dto';
import { ReceiveItemDto } from '../inventory-item/dto/receive-item.dto';
import { MoveItemDto } from '../inventory-item/dto/move-item.dto';
import { paginate, PaginateConfig, PaginateQuery } from 'nestjs-paginate';
import { DateTime } from 'luxon';
import { TransactionEvent } from './events/transaction.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ValidationError } from 'src/common/errors/validation-error';
import { ManualValidationError } from 'src/common/errors/manual-validation-error';
import { plainToInstance } from 'class-transformer';
import { snakeCase } from 'lodash';

@Injectable()
export class TransactionService {
  private transactionRepository: Repository<Transaction>;
  private transactionGroupRepository: Repository<TransactionGroup>;
  private inventoryItemRepository: Repository<InventoryItem>;
  private itemSerialRepository: Repository<ItemSerial>;

  constructor(
    @Inject(CONNECTION) private readonly dataSource: DataSource,
    private readonly i18n: I18nService,
    private lotService: LotService,
    private itemService: ItemService,
    private eventEmitter: EventEmitter2,
  ) {
    this.transactionRepository = this.dataSource.getRepository(Transaction);
    this.transactionGroupRepository =
      this.dataSource.getRepository(TransactionGroup);
    this.inventoryItemRepository = this.dataSource.getRepository(InventoryItem);
    this.itemSerialRepository = this.dataSource.getRepository(ItemSerial);
  }

  async create(createTransactionDto: CreateTransactionDto) {
    const transaction = this.transactionRepository.create(createTransactionDto);

    return await this.transactionRepository.save(transaction);
  }

  async receive(
    acceptLanguage: string,
    xClientId: string,
    receivedItems: IndexedCollectionItemDto<ReceiveItemDto>[],
  ) {
    const failures: {
      index: number;
      children: object[] | I18nValidationError;
      constraints: object;
    }[] = [];
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    const newTransactionNumber = await this.getOneNextSequence('RV');
    const transactionGroup = await queryRunner.manager.insert(
      TransactionGroup,
      {
        transactionNumber: newTransactionNumber,
      },
    );

    const createTransactionDto: CreateTransactionDto = {
      transactionGroupId: transactionGroup.identifiers[0].id,
      slipNumber: `${newTransactionNumber}-1`,
      category: Category.RECEIVING,
      inputType: InputType.WEB_INCOMING,
      status: SlipStatus.IN_STOCK,
      createWorker: 'create_worker_name', // TODO: 추후, User로 대체
    };

    const transaction = await queryRunner.manager.insert(
      Transaction,
      createTransactionDto,
    );
    const transactionId = transaction.identifiers[0].id;
    const total = receivedItems.length;

    for (const [i, receivedItem] of receivedItems.entries()) {
      const { index, collectionItem } = receivedItem;

      await queryRunner.startTransaction();

      try {
        const validationErrors = await this.i18n.validate(collectionItem, {
          lang: acceptLanguage,
        });

        if (validationErrors.length > 0) {
          validationErrors.forEach((error) => {
            const errorConstraints = error.constraints
              ? JSON.parse(JSON.stringify(error.constraints))
              : {};

            Object.entries(errorConstraints).forEach(([key, value]) => {
              throw new ValidationError(key, {
                rule: key,
                value: error.value,
                property: snakeCase(error.property),
                constraints: {
                  key,
                  value: value as string,
                },
              });
            });
          });
        }

        let lot: Lot | null = null;
        let lotId: number | null = null;

        if (collectionItem.lotNo) {
          const lots = await this.lotService.findAll({
            number: collectionItem.lotNo,
            supplierId: collectionItem.supplierId,
          });
          lotId = lots[0]?.id;
        }

        // 로트번호 혼재 가능한경우.
        // const filters: any = {
        //   itemId: collectionItem.itemId,
        //   locationId: collectionItem.locationId,
        //   lotId: lotId === null ? IsNull() : lotId,
        //   status: collectionItem.status,
        // };

        const filters: any = {
          itemId: collectionItem.itemId,
          locationId: collectionItem.locationId,
        };

        const inventoryItemEntity = await this.inventoryItemRepository.findOne({
          where: filters,
        });

        if (inventoryItemEntity) {
          // 한 품목이, 하나의 로케이션에 하나의 로트번호만 가질 수 있다.
          if (
            (!inventoryItemEntity.lotId && collectionItem.lotNo) ||
            inventoryItemEntity.lotId !== lotId
          ) {
            throw new ManualValidationError('error.LOT_ID_MISMATCH', {
              key: 'LOT_ID_MISMATCH',
              property: 'lot_number', // 프론트로 전달 될 값이라 lot_no, lot_id => lot_number로 통일
              value: collectionItem.lotNo ?? '',
            });
          }

          // 한 품목이, 하나의 로케이션에 하나의 재고상태만 가질 수 있다.
          if (collectionItem.status !== inventoryItemEntity.status) {
            throw new ManualValidationError('error.STATUS_MISMATCH', {
              key: 'STATUS_MISMATCH',
              property: 'status',
              value: collectionItem.status,
            });
          }
        }

        if (collectionItem.lotNo && collectionItem.supplierId && !lotId) {
          const createLotDto: CreateLotDto = {
            itemId: collectionItem.itemId,
            supplierId: collectionItem.supplierId,
            number: collectionItem.lotNo,
            expirationDate: collectionItem.expirationDate
              ? collectionItem.expirationDate
              : null,
          };

          const lotValidationErrors = await this.i18n.validate(createLotDto, {
            lang: acceptLanguage,
          });

          if (lotValidationErrors.length > 0) {
            await queryRunner.rollbackTransaction();

            validationErrors.forEach((error) => {
              const errorConstraints = error.constraints
                ? JSON.parse(JSON.stringify(error.constraints))
                : {};

              Object.entries(errorConstraints).forEach(([key, value]) => {
                throw new ValidationError(key, {
                  rule: key,
                  value: error.value,
                  property: snakeCase(error.property),
                  constraints: {
                    key,
                    value: value as string,
                  },
                });
              });
            });
          }

          lot = await this.lotService.create(createLotDto);
          lotId = lot.id;
        }

        const createTransactionItemDto: CreateTransactionItemDto = {
          transactionId: transactionId,
          itemId: collectionItem.itemId,
          locationDepartureId: null,
          locationArrivalId: collectionItem.locationId,
          lotId: lotId,
          supplierId: collectionItem.supplierId,
          operationTypeId: collectionItem.operationTypeId,
          quantity: collectionItem.quantity,
          status: collectionItem.status,
          remark: collectionItem.remark,
        };

        const transactionItemValidationErrors = await this.i18n.validate(
          createTransactionItemDto,
          {
            lang: acceptLanguage,
          },
        );

        if (transactionItemValidationErrors.length > 0) {
          await queryRunner.rollbackTransaction();

          validationErrors.forEach((error) => {
            const errorConstraints = error.constraints
              ? JSON.parse(JSON.stringify(error.constraints))
              : {};

            Object.entries(errorConstraints).forEach(([key, value]) => {
              throw new ValidationError(key, {
                rule: key,
                value: error.value,
                property: snakeCase(error.property),
                constraints: {
                  key,
                  value: value as string,
                },
              });
            });
          });
        }

        await queryRunner.manager.insert(
          TransactionItem,
          createTransactionItemDto,
        );

        if (inventoryItemEntity && inventoryItemEntity.lotId === lotId) {
          await queryRunner.manager.update(InventoryItem, filters, {
            quantity: inventoryItemEntity.quantity + collectionItem.quantity,
          });
        } else {
          const newInventoryItem = this.inventoryItemRepository.create({
            itemId: collectionItem.itemId,
            locationId: collectionItem.locationId,
            quantity: collectionItem.quantity,
            status: collectionItem.status,
            lotId: lotId,
          });

          await queryRunner.manager.insert(InventoryItem, newInventoryItem);
        }

        if (collectionItem?.itemSerial?.serialNo) {
          const itemSerial = this.itemSerialRepository.create({
            itemId: collectionItem.itemId,
            serialNo: collectionItem.itemSerial.serialNo,
          });

          await queryRunner.manager.insert(ItemSerial, itemSerial);
        }

        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();

        if (error instanceof ValidationError) {
          const errors = await this.handleValidationError(
            index,
            acceptLanguage,
            error,
          );

          failures.push(errors);
        } else if (error instanceof ManualValidationError) {
          const errors = await this.handleManualValidationError(
            index,
            acceptLanguage,
            error,
          );

          failures.push(errors);
        } else {
          throw new InternalServerErrorException(error);
        }
      }

      const transactionEvent = new TransactionEvent();
      transactionEvent.id = xClientId;
      transactionEvent.name = 'Import Data Processing';
      transactionEvent.total = total;
      transactionEvent.processed = i + 1;
      this.eventEmitter.emit('transaction.received', transactionEvent);
    }

    await this.transactionRepository.update(transactionId, {
      completedAt: DateTime.utc().toFormat('yyyy-MM-dd HH:mm:ss.SSS'),
    });

    return failures.length ? failures : '';
  }

  async move(
    acceptLanguage: string,
    xClientId: string,
    movedItems: IndexedCollectionItemDto<MoveItemDto>[],
  ) {
    const failures: {
      index: number;
      children: object[] | I18nValidationError;
      constraints: object;
    }[] = [];
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    const newTransactionNumber = await this.getOneNextSequence('MV');
    const transactionGroup = await queryRunner.manager.insert(
      TransactionGroup,
      {
        transactionNumber: newTransactionNumber,
      },
    );

    const createTransactionDto: CreateTransactionDto = {
      transactionGroupId: transactionGroup.identifiers[0].id,
      slipNumber: `${newTransactionNumber}-1`,
      category: Category.MOVEMENT,
      inputType: InputType.WEB_LOCATION_MOVEMENT,
      status: SlipStatus.SHIPPED,
      createWorker: 'create_worker_name', // TODO: 추후, User로 대체
    };

    // 오류가 나서 실패해도, 차수개념으로 무조건 생성
    const transaction = await queryRunner.manager.insert(
      Transaction,
      createTransactionDto,
    );
    const transactionId = transaction.identifiers[0].id;
    const total = movedItems.length;

    for (const [i, movedItem] of movedItems.entries()) {
      const { index, collectionItem } = movedItem;

      await queryRunner.startTransaction();

      try {
        const validationErrors = await this.i18n.validate(collectionItem, {
          lang: acceptLanguage,
        });

        if (validationErrors.length > 0) {
          validationErrors.forEach((error) => {
            const errorConstraints = error.constraints
              ? JSON.parse(JSON.stringify(error.constraints))
              : {};

            Object.entries(errorConstraints).forEach(([key, value]) => {
              throw new ValidationError(key, {
                rule: key,
                value: error.value,
                property: snakeCase(error.property),
                constraints: {
                  key,
                  value: value as string,
                },
              });
            });
          });
        }

        // 로트번호 혼재 가능한경우.
        // const departureFilters: any = {
        //   itemId: collectionItem.itemId,
        //   locationId: collectionItem.locationDepartureId,
        //   lotId: collectionItem.lotId === null ? IsNull() : collectionItem.lotId,
        //   status: collectionItem.status,
        // };

        const departureFilters: any = {
          itemId: collectionItem.itemId,
          locationId: collectionItem.locationDepartureId,
        };

        const departureRecord = await this.inventoryItemRepository.findOne({
          where: departureFilters,
        });

        if (!departureRecord) {
          throw new ManualValidationError('error.rules.NOT_EXIST', {
            key: 'NOT_EXIST',
            property: 'item_id',
            value: collectionItem.itemId,
          });
        }

        if (collectionItem.quantity > departureRecord.quantity) {
          throw new ManualValidationError('error.rules.NOT_ENOUGH', {
            key: 'NOT_ENOUGH',
            property: 'quantity',
            value: collectionItem.quantity,
          });
        }

        // 로트번호 혼재 가능한경우.
        // const arrivalFilters: any = {
        //   itemId: collectionItem.itemId,
        //   locationId: collectionItem.locationArrivalId,
        //   lotId: collectionItem.lotId,
        //   status: collectionItem.status,
        // };

        const arrivalFilters: any = {
          itemId: collectionItem.itemId,
          locationId: collectionItem.locationArrivalId,
        };

        const arrivalRecord = await this.inventoryItemRepository.findOne({
          where: arrivalFilters,
        });

        // TODO: 설정에 따라 적용예정
        if (arrivalRecord) {
          // 한 품목이, 하나의 로케이션에 하나의 로트번호만 가질 수 있다.
          if (collectionItem.lotId !== arrivalRecord.lotId) {
            throw new ManualValidationError('error.LOT_ID_MISMATCH', {
              key: 'LOT_ID_MISMATCH',
              property: 'lot_number', // 프론트로 전달 될 값이라 lot_no, lot_id => lot_number로 통일
              value: collectionItem.lotId ?? '',
            });
          }

          // 한 품목이, 하나의 로케이션에 하나의 재고상태만 가질 수 있다.
          if (collectionItem.status !== arrivalRecord.status) {
            throw new ManualValidationError('error.STATUS_MISMATCH', {
              key: 'STATUS_MISMATCH',
              property: 'status',
              value: collectionItem.status,
            });
          }
        }

        const createTransactionItemDto: CreateTransactionItemDto = {
          transactionId: transactionId,
          itemId: collectionItem.itemId,
          locationDepartureId: collectionItem.locationDepartureId,
          locationArrivalId: collectionItem.locationArrivalId,
          lotId: collectionItem?.lotId,
          supplierId: null,
          operationTypeId: collectionItem.operationTypeId,
          quantity: collectionItem.quantity,
          status: collectionItem.status,
          remark: collectionItem.remark,
        };

        const transactionItemValidationErrors = await this.i18n.validate(
          createTransactionItemDto,
          {
            lang: acceptLanguage,
          },
        );

        if (transactionItemValidationErrors.length > 0) {
          await queryRunner.rollbackTransaction();

          validationErrors.forEach((error) => {
            const errorConstraints = error.constraints
              ? JSON.parse(JSON.stringify(error.constraints))
              : {};

            Object.entries(errorConstraints).forEach(([key, value]) => {
              throw new ValidationError(key, {
                rule: key,
                value: error.value,
                property: snakeCase(error.property),
                constraints: {
                  key,
                  value: value as string,
                },
              });
            });
          });
        }

        await queryRunner.manager.insert(
          TransactionItem,
          createTransactionItemDto,
        );

        const minusQuantity =
          departureRecord.quantity - collectionItem.quantity;

        if (minusQuantity === 0) {
          await queryRunner.manager.delete(InventoryItem, departureFilters);
        } else {
          await queryRunner.manager.update(InventoryItem, departureFilters, {
            quantity: minusQuantity,
          });
        }

        if (arrivalRecord) {
          const plusQuantity = arrivalRecord.quantity + collectionItem.quantity;

          await queryRunner.manager.update(InventoryItem, arrivalFilters, {
            quantity: plusQuantity,
          });
        } else {
          const newInventoryItem = this.inventoryItemRepository.create({
            itemId: collectionItem.itemId,
            locationId: collectionItem.locationArrivalId,
            quantity: collectionItem.quantity,
            status: collectionItem.status,
            lotId: departureRecord?.lotId,
          });

          await queryRunner.manager.insert(InventoryItem, newInventoryItem);
        }

        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();

        if (error instanceof ValidationError) {
          const errors = await this.handleValidationError(
            index,
            acceptLanguage,
            error,
          );

          failures.push(errors);
        } else if (error instanceof ManualValidationError) {
          const errors = await this.handleManualValidationError(
            index,
            acceptLanguage,
            error,
          );

          failures.push(errors);
        } else {
          throw new InternalServerErrorException(error);
        }
      }

      const transactionEvent = new TransactionEvent();
      transactionEvent.id = xClientId;
      transactionEvent.name = 'Import Data Processing';
      transactionEvent.total = total;
      transactionEvent.processed = i + 1;
      this.eventEmitter.emit('transaction.movement', transactionEvent);
    }

    await this.transactionRepository.update(transactionId, {
      completedAt: DateTime.now().toFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
    });

    return failures.length ? failures : '';
  }

  async instructShipping(
    acceptLanguage: string,
    transactionNumber: string,
    zoneIds: number[],
    instructedShippingItems: InstructShippingTransactionDto[],
  ) {
    const failures: {
      index: number;
      children: object[] | I18nValidationError;
      constraints: object;
    }[] = [];
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    const transactionGroup = await queryRunner.manager.insert(
      TransactionGroup,
      {
        transactionNumber,
      },
    );

    for (const [
      index,
      instructedShippingItem,
    ] of instructedShippingItems.entries()) {
      const { items, order, ...instructedShippingDto } = instructedShippingItem;

      await queryRunner.startTransaction();

      try {
        const transactionDto = plainToInstance(
          CreateTransactionDto,
          instructedShippingDto,
        );

        transactionDto.transactionGroupId = transactionGroup.identifiers[0].id;
        transactionDto.status = SlipStatus.SCHEDULED;
        transactionDto.category = Category.SHIPPING;
        transactionDto.inputType = InputType.WEB_OUTGOING;
        transactionDto.createWorker = 'create_worker_name';

        const validationErrors = await this.i18n.validate(transactionDto, {
          lang: acceptLanguage,
        });

        if (validationErrors.length > 0) {
          validationErrors.forEach((error) => {
            const errorConstraints = error.constraints
              ? JSON.parse(JSON.stringify(error.constraints))
              : {};

            Object.entries(errorConstraints).forEach(([key, value]) => {
              throw new ValidationError(key, {
                rule: key,
                value: error.value,
                property: snakeCase(error.property),
                constraints: {
                  key,
                  value: value as string,
                },
              });
            });
          });
        }

        const transaction = await queryRunner.manager.insert(
          Transaction,
          transactionDto,
        );
        const transactionId = transaction.identifiers[0].id;

        for (const zoneId of zoneIds) {
          const createTransactionZoneDto: CreateTransactionZoneDto = {
            transactionId: transactionId,
            zoneId,
          };

          await queryRunner.manager.insert(
            TransactionZone,
            createTransactionZoneDto,
          );
        }

        const transactionB2cOrder = order;
        transactionB2cOrder.transactionId = transactionId;

        const transactionB2cOrderValidationErrors = await this.i18n.validate(
          transactionB2cOrder,
          { lang: acceptLanguage },
        );

        if (transactionB2cOrderValidationErrors.length > 0) {
          validationErrors.forEach((error) => {
            const errorConstraints = error.constraints
              ? JSON.parse(JSON.stringify(error.constraints))
              : {};

            Object.entries(errorConstraints).forEach(([key, value]) => {
              throw new ValidationError(key, {
                rule: key,
                value: error.value,
                property: snakeCase(error.property),
                constraints: {
                  key,
                  value: value as string,
                },
              });
            });
          });
        }

        await queryRunner.manager.insert(
          TransactionB2cOrder,
          transactionB2cOrder,
        );

        for (const item of items) {
          const itemEntity = await this.itemService.findOne(
            item.itemId as number,
          );

          if (!itemEntity) {
            throw new ManualValidationError('error.rules.NOT_EXIST', {
              key: 'NOT_EXIST',
              property: 'item_id',
              value: item.id,
            });
          }

          item.transactionId = transactionId;
          item.status = StockStatus.NORMAL;

          const transactionItemValidationErrors = await this.i18n.validate(
            item,
            {
              lang: acceptLanguage,
            },
          );

          if (transactionItemValidationErrors.length > 0) {
            transactionItemValidationErrors.forEach((error) => {
              const errorConstraints = error.constraints
                ? JSON.parse(JSON.stringify(error.constraints))
                : {};

              Object.entries(errorConstraints).forEach(([key, value]) => {
                throw new ValidationError(key, {
                  rule: key,
                  value: error.value,
                  property: snakeCase(error.property),
                  constraints: {
                    key,
                    value: value as string,
                  },
                });
              });
            });
          }

          await queryRunner.manager.insert(TransactionItem, item);
        }

        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();

        if (error instanceof ValidationError) {
          const errors = await this.handleValidationError(
            index,
            acceptLanguage,
            error,
          );

          failures.push(errors);
        } else if (error instanceof ManualValidationError) {
          const errors = await this.handleManualValidationError(
            index,
            acceptLanguage,
            error,
          );

          failures.push(errors);
        } else {
          throw new InternalServerErrorException(error);
        }
      }
    }

    return failures.length ? failures : '';
  }

  // async ship(shipItemDto: ShipItemDto[]) {
  //   console.log(shipItemDto);
  // }

  async findAll(query: PaginateQuery, findTransactionDto: FindTransactionDto) {
    const { include, startDate, endDate, category, itemName } =
      findTransactionDto;

    // 출고지시
    if (include === 'shipping_instruction') {
      return await this.getManyShippingInstructionList(findTransactionDto);
    }

    const config: PaginateConfig<Transaction> = {
      loadEagerRelations: true,
      sortableColumns: ['id', 'createdAt'],
      defaultSortBy: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
        ['transactionItems.id', 'DESC'],
      ],
      relations: {
        transactionItems: {
          item: { itemCodes: true, itemSerials: true },
          lot: true,
          supplier: true,
          operationType: true,
          locationDeparture: { zone: true },
          locationArrival: { zone: true },
        },
      },
      where: {
        ...(startDate &&
          endDate && {
            createdAt: Between(new Date(startDate), new Date(endDate)),
          }),
        ...(category && { category }),
        ...(itemName && {
          transactionItems: { item: { name: Like(`%${itemName}%`) } },
        }),
      },
    };

    return paginate(query, this.transactionRepository, config);
  }

  async getManyShippingInstructionList(findTransactionDto: FindTransactionDto) {
    const {
      startDate,
      endDate,
      category,
      status,
      itemName,
      recipient,
      contact,
      createdAt,
      completedAt,
      slipNumber,
      number,
      orderType,
      ids,
    } = findTransactionDto;
    const queryBuilder =
      this.transactionRepository.createQueryBuilder('transaction');

    queryBuilder.leftJoinAndSelect(
      'transaction.transactionGroup',
      'transactionGroup',
    );
    queryBuilder.leftJoinAndSelect(
      'transaction.transactionItems',
      'transactionItem',
    );
    queryBuilder.leftJoinAndSelect('transactionItem.item', 'item');
    queryBuilder.leftJoinAndSelect(
      'transaction.transactionB2cOrder',
      'transactionB2cOrder',
    );
    queryBuilder.leftJoinAndSelect(
      'transaction.transactionZones',
      'transactionZone',
    );
    queryBuilder.leftJoinAndSelect('transactionZone.zone', 'zone');

    category &&
      queryBuilder.andWhere('transaction.category = :category', {
        category: Category.SHIPPING,
      });
    status &&
      queryBuilder.andWhere('transaction.status IN (:...status)', {
        status,
      });

    if (ids) {
      queryBuilder.andWhere(`transaction.id IN (${ids})`);

      return queryBuilder.getMany();
    }

    createdAt &&
      startDate &&
      endDate &&
      queryBuilder.andWhere(
        'transaction.created_at BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
    completedAt &&
      startDate &&
      endDate &&
      queryBuilder.andWhere(
        'transaction.completed_at BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
    slipNumber &&
      queryBuilder.andWhere('transaction.slipNumber like :slipNumber', {
        slipNumber: `%${slipNumber}%`,
      });
    itemName &&
      queryBuilder.andWhere('item.name like :itemName', {
        itemName: `%${itemName}%`,
      });
    number &&
      queryBuilder.andWhere('transaction_b2c_order.number like :number', {
        number: `%${number}%`,
      });
    recipient &&
      queryBuilder.andWhere('transaction_b2c_order.recipient like :recipient', {
        recipient: `%${recipient}%`,
      });
    contact &&
      queryBuilder.andWhere('transaction_b2c_order.contact like :contact', {
        contact: `%${contact}%`,
      });

    // 단포 or 합포 필터
    if (orderType) {
      const subQuery = this.transactionRepository
        .createQueryBuilder('subTransaction')
        .select('subTransaction.id')
        .leftJoin('subTransaction.transactionItems', 'subTransactionItem')
        .groupBy('subTransaction.id')
        .having(
          orderType === 'single'
            ? 'COUNT(subTransactionItem.id) = 1 AND SUM(subTransactionItem.quantity) = 1'
            : 'COUNT(subTransactionItem.id) > 1 AND SUM(subTransactionItem.quantity) > 1',
        );

      queryBuilder.andWhere(`transaction.id IN (${subQuery.getQuery()})`);
    }

    queryBuilder.orderBy({ 'transaction.createdAt': 'DESC' });

    return await queryBuilder.getMany();
  }

  async findOne(id: number, include: string) {
    const filters: any = {
      relations: {
        transactionItems: {
          item: true,
          supplier: true,
          operationType: true,
          locationDeparture: { zone: true },
          locationArrival: { zone: true },
        },
      },
    };

    // 출고지시
    if (include === 'shipping_instruction') {
      filters.relations = {
        transactionGroup: true,
        transactionItems: { item: true },
        transactionB2cOrder: true,
        transactionZones: { zone: true },
      };
    }

    filters.where = { id };

    return await this.transactionRepository.findOne(filters);
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto) {
    await this.transactionRepository.update(id, updateTransactionDto);
  }

  private async getOneNextSequence(status: string) {
    const now = DateTime.now().startOf('day');
    const today = now.toFormat('yyyy-MM-dd');
    const nowDate = now.toFormat('yyyyMMdd');

    const transactionGroupRepository =
      await this.transactionGroupRepository.findOne({
        select: { transactionNumber: true },
        where: {
          transactionNumber: Like(`${status}%`),
          createdAt: Raw(
            (alias) => `date_format(${alias}, '%Y-%m-%d') = '${today}'`,
          ),
        },
        order: {
          id: 'DESC',
        },
      });

    const latestSequence = transactionGroupRepository
      ? parseInt(
          transactionGroupRepository.transactionNumber.split('-')[1],
          10,
        ) + 1
      : 1;

    return await `${status}${nowDate}-${String(latestSequence).padStart(6, '0')}`;
  }

  private async handleValidationError(
    index: number,
    acceptLanguage: string,
    error: ValidationError,
  ): Promise<{
    index: number;
    children: object[] | I18nValidationError;
    constraints: object;
  }> {
    return {
      index,
      children: [
        {
          value: error.extra?.value,
          property: error.extra?.property as string,
          children: [],
          constraints: {
            [error.extra?.constraints?.key.toLowerCase() as string]:
              this.i18n.t(error.extra?.constraints?.value as string, {
                lang: acceptLanguage,
                args: {
                  message: error.key,
                },
              }),
          },
        },
      ],
      constraints: {},
    };
  }

  private async handleManualValidationError(
    index: number,
    acceptLanguage: string,
    error: ManualValidationError,
  ): Promise<{
    index: number;
    children: object[] | I18nValidationError;
    constraints: object;
  }> {
    return {
      index,
      children: [
        {
          value: error.extra?.value,
          property: error.extra?.property as string,
          children: [],
          constraints: {
            [error.extra?.key.toLowerCase() as string]: this.i18n.t(
              error.message,
              {
                lang: acceptLanguage,
                args: {
                  message: error.extra?.property,
                },
              },
            ),
          },
        },
      ],
      constraints: {},
    };
  }
}
