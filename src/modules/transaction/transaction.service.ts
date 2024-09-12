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
import { TransactionGroup } from '../transaction-group/entities/transaction-group.entity';
import { LotService } from '../lot/lot.service';
import { ItemService } from '../item/item.service';
import {
  Category,
  InputType,
  SlipStatus,
  StockAllocationMethod,
  ZoneFilter,
} from '../enum';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FindTransactionDto } from './dto/find-transaction.dto';
import { CreateShippingTransactionDto } from './dto/create-shipping-transaction.dto';
import { CreateLotDto } from '../lot/dto/create-lot.dto';
import { IndexedCollectionItemDto } from '../inventory-item/dto/index-collection-item.dto';
import { ReceiveInventoryItemDto } from '../inventory-item/dto/receive-inventory-item.dto';
import { MoveInventoryItemDto } from '../inventory-item/dto/move-inventory-item.dto';
import { paginate, PaginateConfig, PaginateQuery } from 'nestjs-paginate';
import { DateTime } from 'luxon';
import { TransactionEvent } from './events/transaction.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ValidationError } from 'src/common/errors/validation-error';
import { ManualValidationError } from 'src/common/errors/manual-validation-error';
import { snakeCase } from 'lodash';
import { StockAllocated } from '../stock-allocated/entities/stock-allocated.entity';
import { In } from 'typeorm';
import { StockAllocationRuleShop } from '../stock-allocation-rule-shop/entities/stock-allocation-rule-shop.entity';
import { StockAllocationRuleZone } from '../stock-allocation-rule-zone/entities/stock-allocation-rule-zone.entity';
import { PaginateDto } from '../paginate.dto';
import { Supplier } from '../supplier/entities/supplier.entity';

@Injectable()
export class TransactionService {
  private transactionRepository: Repository<Transaction>;
  private transactionGroupRepository: Repository<TransactionGroup>;
  private inventoryItemRepository: Repository<InventoryItem>;
  private itemSerialRepository: Repository<ItemSerial>;
  private stockAllocatedRepository: Repository<StockAllocated>;
  private supplierRepository: Repository<Supplier>;

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
    this.stockAllocatedRepository =
      this.dataSource.getRepository(StockAllocated);
    this.supplierRepository = this.dataSource.getRepository(Supplier);
  }

  async create(createTransactionDto: CreateTransactionDto) {
    const transaction = this.transactionRepository.create(createTransactionDto);

    return await this.transactionRepository.save(transaction);
  }

  async receive(
    acceptLanguage: string,
    xClientId: string,
    receivedItems: IndexedCollectionItemDto<ReceiveInventoryItemDto>[],
  ) {
    const failures: {
      index: number;
      children: object[] | I18nValidationError;
      constraints: object;
    }[] = [];
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    const newTransactionNumber = await this.getOneNextSequence('RV');
    const transactionGroup = new TransactionGroup();
    transactionGroup.transactionNumber = newTransactionNumber;

    await queryRunner.manager.save(TransactionGroup, transactionGroup);

    const transaction = new Transaction();
    transaction.transactionGroup = transactionGroup;
    transaction.slipNumber = `${newTransactionNumber}-1`;
    transaction.status = SlipStatus.IN_STOCK;
    transaction.category = Category.RECEIVING;
    transaction.inputType = InputType.WEB_INCOMING;
    transaction.createWorker = 'create_worker_name';

    await queryRunner.manager.save(Transaction, transaction);

    const total = receivedItems.length;

    for (const [i, receivedItem] of receivedItems.entries()) {
      const { index, collectionItem } = receivedItem;

      await queryRunner.startTransaction();

      try {
        const supplierEntity = await this.supplierRepository.findOne({
          where: { id: collectionItem.supplierId },
        });

        if (!supplierEntity) {
          throw new ManualValidationError('error.rules.NOT_EXIST', {
            key: 'NOT_EXIST',
            property: 'supplier',
            value: collectionItem.supplierId ?? '',
          });
        }

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
              property: 'lotNumber',
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

        const transactionItem = new TransactionItem();
        transactionItem.transaction = transaction;
        transactionItem.itemId = collectionItem.itemId;
        transactionItem.locationDepartureId = null;
        transactionItem.locationArrivalId = collectionItem.locationId;
        transactionItem.lotId = lotId;
        transactionItem.supplierId = collectionItem.supplierId;
        transactionItem.operationTypeId = collectionItem.operationTypeId;
        transactionItem.orderedQuantity = collectionItem.quantity;
        transactionItem.status = SlipStatus.IN_STOCK;
        transactionItem.remark = collectionItem.remark;

        const transactionItemValidationErrors = await this.i18n.validate(
          transactionItem,
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

        await queryRunner.manager.save(TransactionItem, transactionItem);

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

          await queryRunner.manager.save(InventoryItem, newInventoryItem);
        }

        if (collectionItem?.itemSerial?.serialNo) {
          const itemSerial = this.itemSerialRepository.create({
            itemId: collectionItem.itemId,
            serialNo: collectionItem.itemSerial.serialNo,
          });

          await queryRunner.manager.save(ItemSerial, itemSerial);
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

    transaction.completedAt = new Date();
    await this.transactionRepository.save(transaction);

    return failures;
  }

  async move(
    acceptLanguage: string,
    xClientId: string,
    movedItems: IndexedCollectionItemDto<MoveInventoryItemDto>[],
  ) {
    const failures: {
      index: number;
      children: object[] | I18nValidationError;
      constraints: object;
    }[] = [];
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    const newTransactionNumber = await this.getOneNextSequence('MV');
    const transactionGroup = new TransactionGroup();
    transactionGroup.transactionNumber = newTransactionNumber;

    await queryRunner.manager.save(TransactionGroup, transactionGroup);

    const transaction = new Transaction();
    transaction.transactionGroup = transactionGroup;
    transaction.slipNumber = `${newTransactionNumber}-1`;
    transaction.status = SlipStatus.TRANSFERRED;
    transaction.category = Category.MOVEMENT;
    transaction.inputType = InputType.WEB_LOCATION_MOVEMENT;
    transaction.createWorker = 'create_worker_name'; // TODO: 추후, User로 대체

    await queryRunner.manager.save(Transaction, transaction);

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
            property: 'itemId',
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
              property: 'lotNumber',
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

        const transactionItem = new TransactionItem();
        transactionItem.transaction = transaction;
        transactionItem.itemId = collectionItem.itemId;
        transactionItem.locationDepartureId =
          collectionItem.locationDepartureId;
        transactionItem.locationArrivalId = collectionItem.locationArrivalId;
        transactionItem.lotId = collectionItem?.lotId;
        transactionItem.supplierId = null;
        transactionItem.operationTypeId = collectionItem.operationTypeId;
        transactionItem.orderedQuantity = collectionItem.quantity;
        transactionItem.status = SlipStatus.TRANSFERRED;
        transactionItem.remark = collectionItem.remark;

        const transactionItemValidationErrors = await this.i18n.validate(
          transactionItem,
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

        await queryRunner.manager.save(TransactionItem, transactionItem);

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
          const inventoryItem = new InventoryItem();
          inventoryItem.itemId = collectionItem.itemId;
          inventoryItem.locationId = collectionItem.locationArrivalId;
          inventoryItem.quantity = collectionItem.quantity;
          inventoryItem.status = collectionItem.status;
          inventoryItem.lotId = departureRecord?.lotId;

          await queryRunner.manager.insert(InventoryItem, inventoryItem);
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

    transaction.completedAt = new Date();
    await this.transactionRepository.save(transaction);

    return failures;
  }

  async instructShipping(
    acceptLanguage: string,
    transactionNumber: string,
    instructedShippingItems: CreateShippingTransactionDto[],
  ) {
    const failures: {
      index: number;
      children: object[] | I18nValidationError;
      constraints: object;
    }[] = [];
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    const transactionGroup = new TransactionGroup();
    transactionGroup.transactionNumber = transactionNumber;

    await queryRunner.manager.save(TransactionGroup, transactionGroup);

    for (const [
      index,
      instructedShippingItem,
    ] of instructedShippingItems.entries()) {
      const { items, order, ...instructedShippingDto } = instructedShippingItem;

      await queryRunner.startTransaction();

      try {
        const transaction = new Transaction();
        transaction.transactionGroup = transactionGroup;
        transaction.slipNumber = instructedShippingDto.slipNumber;
        transaction.status = SlipStatus.SCHEDULED;
        transaction.category = Category.SHIPPING;
        transaction.inputType = InputType.WEB_OUTGOING;
        transaction.createWorker = 'create_worker_name';

        const validationErrors = await this.i18n.validate(transaction, {
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

        await queryRunner.manager.save(Transaction, transaction);

        const transactionB2cOrder = new TransactionB2cOrder();
        transactionB2cOrder.transaction = transaction;
        transactionB2cOrder.number = order.number;
        transactionB2cOrder.shopId = order.shopId;
        transactionB2cOrder.recipient = order.recipient;
        transactionB2cOrder.contact = order.contact;
        transactionB2cOrder.postCode = order.postCode;
        transactionB2cOrder.address = order.address;
        transactionB2cOrder.detailAddress = order.detailAddress;
        transactionB2cOrder.orderedAt = order.orderedAt;

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

        await queryRunner.manager.save(
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
              property: 'itemId',
              value: item.itemId,
            });
          }

          const transactionItem = new TransactionItem();
          transactionItem.transaction = transaction;
          transactionItem.item = itemEntity;
          transactionItem.status = SlipStatus.SCHEDULED;
          transactionItem.orderedQuantity = item.orderedQuantity;
          transactionItem.price = item.price;
          transactionItem.remark = item.remark;

          const transactionItemValidationErrors = await this.i18n.validate(
            transactionItem,
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

          await queryRunner.manager.save(TransactionItem, transactionItem);
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

    return failures;
  }

  // async ship(shipItemDto: ShipItemDto[]) {
  //   console.log(shipItemDto);
  // }

  // 입출고 및 이동 내역
  async findAll(query: PaginateQuery, findTransactionDto: FindTransactionDto) {
    const { startDate, endDate, category, itemName } = findTransactionDto;

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

  async getManyShippingList(
    findTransactionDto: FindTransactionDto,
    paginateDto?: PaginateDto,
  ) {
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
    queryBuilder.leftJoinAndSelect('item.itemCodes', 'itemCode');
    queryBuilder.leftJoinAndSelect('item.itemSerials', 'itemSerial');
    queryBuilder.leftJoinAndSelect(
      'transactionItem.stockAllocations',
      'stockAllocation',
    );
    queryBuilder.leftJoinAndSelect('stockAllocation.location', 'location');
    queryBuilder.leftJoinAndSelect('location.zone', 'zone');
    queryBuilder.leftJoinAndSelect('stockAllocation.lot', 'lot');
    queryBuilder.leftJoinAndSelect(
      'transaction.transactionB2cOrder',
      'transactionB2cOrder',
    );
    queryBuilder.leftJoinAndSelect('transactionB2cOrder.shop', 'shop');

    const {
      dateType,
      startDate,
      endDate,
      category,
      status,
      itemName,
      recipient,
      contact,
      slipNumber,
      number,
      orderType,
      ids,
    } = findTransactionDto;

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

      return await queryBuilder.getMany();
    }

    dateType == 'createdAt' &&
      startDate &&
      endDate &&
      queryBuilder.andWhere(
        'transaction.createdAt BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
    dateType == 'completedAt' &&
      startDate &&
      endDate &&
      queryBuilder.andWhere(
        'transaction.completedAt BETWEEN :startDate AND :endDate',
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
      queryBuilder.andWhere('transactionB2cOrder.number like :number', {
        number: `%${number}%`,
      });
    recipient &&
      queryBuilder.andWhere('transactionB2cOrder.recipient like :recipient', {
        recipient: `%${recipient}%`,
      });
    contact &&
      queryBuilder.andWhere('transactionB2cOrder.contact like :contact', {
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
            ? 'COUNT(subTransactionItem.id) = 1 AND SUM(subTransactionItem.orderedQuantity) = 1'
            : 'COUNT(subTransactionItem.id) > 1 AND SUM(subTransactionItem.orderedQuantity) > 1',
        );

      queryBuilder.andWhere(`transaction.id IN (${subQuery.getQuery()})`);
    }

    if (paginateDto && paginateDto.sortBy) {
      paginateDto.sortBy.forEach(([field, orderBy]) => {
        queryBuilder.addOrderBy(field, orderBy as 'ASC' | 'DESC');
      });
    } else {
      queryBuilder.orderBy({ 'transaction.createdAt': 'DESC' });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: number) {
    const filters: any = {
      relations: {
        transactionGroup: true,
        transactionItems: {
          item: {
            itemCodes: true,
            itemSerials: true,
          },
          stockAllocations: { location: { zone: true }, lot: true },
        },
        transactionB2cOrder: { shop: true },
      },
    };

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

  async allocateToStock(
    acceptLanguage: string,
    transaction,
    inventoryItems,
    stockAllocationRules,
  ) {
    inventoryItems = inventoryItems.map(
      (item: { availableQuantity: number }) => ({
        ...item,
        originalQuantity: item.availableQuantity,
      }),
    );

    const failures: any[] = [];
    const transactionShopId = transaction.transactionB2cOrder.shopId;
    const transactionItems = transaction.transactionItems;
    const transactionItemsLength = transactionItems.length;
    const transactionItemIds: number[] = [];
    let allocations: StockAllocated[] = [];
    let detailErrors: any[] = [];
    let isAllocationSuccessCount = 0; // 완전 할당 count

    for (const transactionItem of transactionItems) {
      transactionItemIds.push(transactionItem.id);
      let remainingQuantity = transactionItem.orderedQuantity;

      // 품목 별 재고 filtering
      let filteredInventoryItems = inventoryItems.filter(
        (inventoryItem: { itemId: number }) =>
          inventoryItem.itemId === transactionItem.itemId,
      );

      if (!filteredInventoryItems || filteredInventoryItems.length === 0) {
        // 재고 전부 소진해서 없을 때 체크
        detailErrors.push({
          item: {
            name: transactionItem.item.name,
          },
          quantity: transactionItem.orderedQuantity,
          error: this.i18n.t('error.STOCK_SHORTAGE', {
            lang: acceptLanguage,
          }),
        });

        continue;
      }

      // 재고할당 룰 순회
      stockAllocationRules: for (const rule of stockAllocationRules) {
        filteredInventoryItems = await this.filterInventoryItems(
          filteredInventoryItems,
          rule,
          transactionShopId,
        );

        if (!filteredInventoryItems || filteredInventoryItems.length === 0) {
          continue;
        }

        for (const filteredInventoryItem of filteredInventoryItems) {
          if (
            filteredInventoryItem.itemId !== transactionItem.itemId ||
            filteredInventoryItem.availableQuantity === 0
          ) {
            continue;
          }

          const allocatedQuantity = Math.min(
            filteredInventoryItem.availableQuantity,
            remainingQuantity,
          );

          // 재고 차감
          filteredInventoryItem.availableQuantity -= allocatedQuantity;
          remainingQuantity -= allocatedQuantity;

          const stockAllocated = new StockAllocated();
          stockAllocated.transactionItem = transactionItem;
          stockAllocated.item = transactionItem.item;
          stockAllocated.locationId = filteredInventoryItem.locationId;
          stockAllocated.lotId = filteredInventoryItem.lotId;
          stockAllocated.quantity = allocatedQuantity;

          allocations.push(stockAllocated);

          // 한 품목에 재고할당이 완료되면 다음 품목으로 이동
          if (remainingQuantity === 0) {
            isAllocationSuccessCount++;
            break stockAllocationRules;
          }
        }
      }

      // 한 품목에 재고할당이 온전히 되지 않은 경우 => 할당 실패
      if (remainingQuantity > 0) {
        allocations = allocations.filter((allocation) => {
          if (allocation.transactionItem.id === transactionItem.id) {
            const relatedInventoryItem = inventoryItems.find(
              (item: {
                itemId: number;
                locationId: number;
                lotId: number | null | undefined;
              }) =>
                item.itemId === allocation.itemId &&
                item.locationId === allocation.locationId &&
                item.lotId === allocation.lotId,
            );

            if (relatedInventoryItem) {
              relatedInventoryItem.availableQuantity += allocation.quantity;
            }

            return false;
          }

          return true;
        });

        detailErrors.push({
          item: {
            name: transactionItem.item.name,
          },
          quantity: transactionItem.orderedQuantity,
          error: this.i18n.t('error.STOCK_SHORTAGE', {
            lang: acceptLanguage,
          }),
        });
      }
    }

    if (detailErrors.length > 0) {
      failures.push({
        slipNumber: transaction.slipNumber,
        transactionB2cOrder: {
          recipient: transaction.transactionB2cOrder.recipient,
        },
        transactionItems: detailErrors,
        createdAt: transaction.createdAt,
      });

      detailErrors = [];
    }

    // 모든 품목이 온전히 할당 됐을 때, 전표상태 변경
    // 주문 :: 출고예정(SlipStatus.SCHEDULED) -> 출고지시완료(할당완료)(SlipStatus.ALLOCATED)
    // 주문의품목 :: 출고예정(SlipStatus.SCHEDULED) -> 출고지시완료(할당완료)(SlipStatus.ALLOCATED)
    if (transactionItemsLength === isAllocationSuccessCount) {
      transaction.status = SlipStatus.ALLOCATED;
      transaction.transactionItems.forEach((item: { status: SlipStatus }) => {
        item.status = SlipStatus.ALLOCATED;
      });
    } else {
      allocations = allocations.filter(
        (allocation) =>
          !transactionItemIds.includes(allocation.transactionItem.id),
      );
    }

    await this.transactionRepository.save(transaction);

    const batchSize = 500;
    const allocationsLength = allocations.length;
    for (let i = 0; i < allocationsLength; i += batchSize) {
      const allocation = allocations.slice(i, i + batchSize);
      await this.stockAllocatedRepository.save(allocation);
    }

    return failures;
  }

  private async filterInventoryItems(
    filteredInventoryItems: any[],
    rule: {
      stockAllocationRuleShops: StockAllocationRuleShop[];
      stockAllocationRuleZones: StockAllocationRuleZone[];
      zoneFilter: ZoneFilter;
      method: StockAllocationMethod;
    },
    transactionShopId: number,
  ) {
    const ruleShops = rule.stockAllocationRuleShops;
    const ruleZones = rule.stockAllocationRuleZones;

    // 선택 된 판매처(shop) 탐색
    if (ruleShops.length > 0) {
      const isShopIncluded = ruleShops.some(
        (ruleShop: { shopId: number }) => ruleShop.shopId === transactionShopId,
      );

      if (!isShopIncluded) {
        return filteredInventoryItems;
      }
    }

    // 선택 된 존(zone) 탐색
    if (ruleZones.length > 0) {
      if (rule.zoneFilter === ZoneFilter.INCLUDE) {
        filteredInventoryItems = filteredInventoryItems.filter(
          (inventoryItem: { zoneId: number }) =>
            ruleZones.some(
              (ruleZone: { zoneId: number }) =>
                ruleZone.zoneId === inventoryItem.zoneId,
            ),
        );
      } else if (rule.zoneFilter === ZoneFilter.EXCLUDE) {
        filteredInventoryItems = filteredInventoryItems.filter(
          (inventoryItem: { zoneId: number }) =>
            !ruleZones.some(
              (ruleZone: { zoneId: number }) =>
                ruleZone.zoneId === inventoryItem.zoneId,
            ),
        );
      }
    }

    // 할당 방식 sorting
    if (rule.method == StockAllocationMethod.FEFO) {
      filteredInventoryItems = filteredInventoryItems.sort(
        (
          a: { lot: { expirationDate: Date } },
          b: { lot: { expirationDate: Date } },
        ) => {
          const dateA = a.lot?.expirationDate;
          const dateB = b.lot?.expirationDate;

          if (dateA === dateB) return 0;
          if (dateA === null) return 1;
          if (dateB === null) return -1;

          return (
            new Date(dateA as Date).getTime() -
            new Date(dateB as Date).getTime()
          );
        },
      );
    } else if (rule.method == StockAllocationMethod.LPR) {
      filteredInventoryItems = filteredInventoryItems.sort(
        (a: { quantity: number }, b: { quantity: number }) => {
          const quantityA = a.quantity;
          const quantityB = b.quantity;

          if (quantityA === quantityB) return 0;
          if (quantityA === null) return 1;
          if (quantityB === null) return -1;

          return quantityA - quantityB;
        },
      );
    }

    return filteredInventoryItems;
  }

  async deallocateToStock(transaction: Transaction) {
    const transactionItemIds = transaction.transactionItems.map(
      (item) => item.id,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.stockAllocatedRepository.delete({
        transactionItemId: In(transactionItemIds),
      });

      transaction.status = SlipStatus.SCHEDULED;
      transaction.transactionItems.forEach((item: { status: SlipStatus }) => {
        item.status = SlipStatus.SCHEDULED;
      });
      await this.transactionRepository.save(transaction);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async patchBulk(
    transactions: Transaction[],
    updateTransactionDto: UpdateTransactionDto,
  ) {
    const { status } = updateTransactionDto;

    // 컬럼별 처리 많아지면 각각 함수로 분리
    if (status) {
      const status = Object.keys(SlipStatus).find(
        (key) => SlipStatus[key] === updateTransactionDto.status,
      );

      // const transactionIds = transactions.map((transaction) => transaction.id);

      // await this.transactionRepository.update(
      //   { id: In(transactionIds) },
      //   { status: SlipStatus[status as SlipStatus] },
      // );

      transactions.forEach((transaction) => {
        transaction.status = status as SlipStatus;
      });
    }

    await this.transactionRepository.save(transactions);
  }

  async patch(
    transaction: Transaction,
    updateTransactionDto: UpdateTransactionDto,
  ) {
    // 컬럼별 처리 많아지면 각각 함수로 분리
    if (updateTransactionDto.status) {
      const status = Object.keys(SlipStatus).find(
        (key) => SlipStatus[key] === updateTransactionDto.status,
      );

      transaction.status = status as SlipStatus;
    }

    await this.transactionRepository.save(transaction);
  }
}
