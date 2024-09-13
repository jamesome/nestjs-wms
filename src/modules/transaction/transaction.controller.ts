import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  UseInterceptors,
  HttpCode,
  Req,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  Inject,
  ParseBoolPipe,
  InternalServerErrorException,
  Patch,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PartialResponseInterceptor } from 'src/common/interceptors/partial-response.interceptor';
import { CONNECTION, HttpStatus, MAX_UPLOAD_SIZE } from 'src/common/constants';
import { DataSource, Repository } from 'typeorm';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { I18nService } from 'nestjs-i18n';
import { Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from 'src/services/file.service';
import { TransactionService } from './transaction.service';
import { InventoryItemService } from '../inventory-item/inventory-item.service';
import { ManualValidationError } from 'src/common/errors/manual-validation-error';
import { CustomHttpException } from 'src/common/exceptions/custom-http.exception';
import { ItemCode } from '../item-code/entities/item-code.entity';
import { Location } from '../location/entities/location.entity';
import { Supplier } from '../supplier/entities/supplier.entity';
import { OperationType } from '../operation-type/entities/operation-type.entity';
import { InventoryItem } from '../inventory-item/entities/inventory-item.entity';
import { StockAllocationRule } from '../stock-allocation-rule/entities/stock-allocation-rule.entity';
import { Lot } from '../lot/entities/lot.entity';
import { Category, SlipStatus, StockStatus } from '../enum';
import { TransactionEvent } from './events/transaction.event';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FindTransactionDto } from './dto/find-transaction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { IndexedCollectionItemDto } from '../inventory-item/dto/index-collection-item.dto';
import { ReceiveInventoryItemDto } from '../inventory-item/dto/receive-inventory-item.dto';
import { MoveInventoryItemDto } from '../inventory-item/dto/move-inventory-item.dto';
import { CreateShippingTransactionDto } from './dto/create-shipping-transaction.dto';
import { PaginateDto } from '../paginate.dto';

@Controller(['transactions', 'warehouses/:warehouseId/transactions'])
@ApiTags('Transaction API')
export class TransactionController {
  private itemCodeRepository: Repository<ItemCode>;
  private locationRepository: Repository<Location>;
  private supplierRepository: Repository<Supplier>;
  private operationTypeRepository: Repository<OperationType>;
  private lotRepository: Repository<Lot>;
  private inventoryItemRepository: Repository<InventoryItem>;
  private stockAllocationRuleRepository: Repository<StockAllocationRule>;

  constructor(
    @Inject(CONNECTION) private readonly dataSource: DataSource,
    private readonly i18n: I18nService,
    private readonly transactionService: TransactionService,
    private readonly inventoryItemService: InventoryItemService,
    private readonly fileService: FileService,
    private eventEmitter: EventEmitter2,
  ) {
    this.itemCodeRepository = this.dataSource.getRepository(ItemCode);
    this.locationRepository = this.dataSource.getRepository(Location);
    this.supplierRepository = this.dataSource.getRepository(Supplier);
    this.operationTypeRepository = this.dataSource.getRepository(OperationType);
    this.lotRepository = this.dataSource.getRepository(Lot);
    this.inventoryItemRepository = this.dataSource.getRepository(InventoryItem);
    this.stockAllocationRuleRepository =
      this.dataSource.getRepository(StockAllocationRule);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Created' })
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    return await this.transactionService.create(createTransactionDto);
  }

  @Post('receiving')
  @ApiOperation({ summary: '입고' })
  @ApiOkResponse()
  @UseInterceptors(new PartialResponseInterceptor())
  async receive(
    @Req() request: Request,
    @Body('data') data: ReceiveInventoryItemDto[],
  ) {
    let globalIndex = 0;

    const receivedItems = data.map((collectionItem) => ({
      index: globalIndex++,
      collectionItem: plainToInstance(ReceiveInventoryItemDto, collectionItem),
    }));

    const result = await this.transactionService.receive(
      request.header('accept-Language') as string,
      request.header('x-client-id') as string,
      receivedItems,
    );

    return {
      requested: data.length,
      result,
    };
  }

  @Post('movement')
  @ApiOperation({ summary: '이동' })
  @ApiOkResponse()
  @UseInterceptors(new PartialResponseInterceptor())
  async move(
    @Req() request: Request,
    @Body('data') data: MoveInventoryItemDto[],
  ) {
    let globalIndex = 0;

    const movedItems = data.map((collectionItem) => ({
      index: globalIndex++,
      collectionItem: plainToInstance(MoveInventoryItemDto, collectionItem),
    }));

    const result = await this.transactionService.move(
      request.header('accept-Language') as string,
      request.header('x-client-id') as string,
      movedItems,
    );

    return {
      requested: data.length,
      result,
    };
  }

  @Post('shipping-instruct')
  @ApiOperation({ summary: '출고지시' })
  @ApiOkResponse()
  @UseInterceptors(new PartialResponseInterceptor())
  async instructShipping(
    @Req() request: Request,
    @Body('transactionNumber') transactionNumber: string,
    @Body('data') data: CreateShippingTransactionDto[],
  ) {
    const instructedItems = plainToInstance(CreateShippingTransactionDto, data);

    const result = await this.transactionService.instructShipping(
      request.header('accept-Language') as string,
      transactionNumber,
      instructedItems,
    );

    return {
      requested: data.length,
      result,
    };
  }

  // @Post('shipping')
  // @ApiOperation({ summary: '출고' })
  // @ApiOkResponse()
  // @UseInterceptors(new PartialResponseInterceptor())
  // async ship(@Req() request: Request, @Body('data') data: ShipItemDto[]) {
  //   return await this.transactionService.ship(request, data);
  // }

  @Get()
  async findAll(
    @Paginate() query: PaginateQuery,
    @Query() findTransactionDto: FindTransactionDto,
  ) {
    // 출고예정정보 내역, 출고지시 내역
    // TODO: 출고~ 내역에서 status가 없을 때 어떻게 할지
    const { statuses } = findTransactionDto;
    if (statuses) {
      findTransactionDto.statuses =
        typeof statuses === 'string' ? [statuses] : statuses;

      return await this.transactionService.getManyShippingList(
        findTransactionDto,
      );
    }

    return await this.transactionService.findAll(query, findTransactionDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.transactionService.findOne(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'SUCCESS' })
  async update(
    @Param('id') id: number,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return await this.transactionService.update(id, updateTransactionDto);
  }

  @Post('receiving:import')
  @ApiOperation({ summary: '파일입고' })
  @UseInterceptors(new PartialResponseInterceptor())
  @UseInterceptors(FileInterceptor('file'))
  async importReceivingData(
    @Req() request: Request,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MAX_UPLOAD_SIZE })], // 10MB
      }),
    )
    file: Express.Multer.File,
    @Body('headerMapping') headerMapping: string,
    @Body('isHeader', ParseBoolPipe) isHeader: boolean,
  ) {
    const headers = JSON.parse(headerMapping);
    const acceptLanguage = request.header('accept-Language') as string;
    const failures: any[] = [];

    const {
      locationDepartureName: locationDepartureName,
      // locationArrivalName: locationArrivalNameHeader,
      itemCode: itemCodeHeader,
      // itemName: itemNameHeader,
      // itemProperty: itemPropertyHeader,
      itemSerial: itemSerialHeader,
      supplierName: supplierNameHeader,
      lotNumber: lotNumberHeader,
      expirationDate: expirationDateHeader,
      operationTypeName: operationTypeNameHeader,
      quantity: quantityHeader,
      status: statusHeader,
      remark: remarkHeader,
    } = headers;

    const fileData = await this.fileService.fileToJson(file, isHeader);
    const indexedCollectionItems: {
      index: number;
      collectionItem: ReceiveInventoryItemDto;
    }[] = [];

    // 모든 데이터를 DB 조회하지 않고, 중복 된 데이터인 경우 caching 된 데이터를 활용
    const itemCodeCached = new CachingHandler();
    const locationCached = new CachingHandler();
    const supplierCached = new CachingHandler();
    const operationTypeCached = new CachingHandler();

    const receivedItems = await this.preProcessing(fileData);
    const total = receivedItems.length;

    for (const index in receivedItems) {
      const collectionItem = new ReceiveInventoryItemDto();
      const receivedItem = receivedItems[index]['collectionItem'];

      try {
        // itemCode
        const itemCode = receivedItem[itemCodeHeader];
        if (!itemCode) {
          throw new ManualValidationError('error.rules.IS_NOT_EMPTY', {
            error: 'IS_NOT_EMPTY',
            key: 'itemCode',
            property: isHeader ? 'itemCode' : itemCodeHeader,
          });
        }

        if (itemCodeCached.get(itemCode)) {
          collectionItem.itemId = itemCodeCached.get(itemCode);
        } else {
          const itemCodeEntity = await this.itemCodeRepository.findOne({
            where: { code: itemCode },
          });

          if (!itemCodeEntity) {
            throw new ManualValidationError('error.rules.NOT_EXIST', {
              error: 'NOT_EXIST',
              key: 'itemCode',
              property: isHeader ? 'itemCode' : itemCodeHeader,
            });
          }

          collectionItem.itemId = itemCodeEntity.itemId;
          itemCodeCached.set(itemCode, itemCodeEntity.itemId);
        }
        // ----------------------------------------------------------------

        // locationDepartureName
        const locationName = receivedItem[locationDepartureName];
        if (!locationName) {
          throw new ManualValidationError('error.rules.IS_NOT_EMPTY', {
            error: 'IS_NOT_EMPTY',
            key: 'locationDepartureName',
            property: isHeader
              ? 'locationDepartureName'
              : locationDepartureName,
          });
        }

        if (locationCached.get(locationName)) {
          collectionItem.locationId = locationCached.get(locationName);
        } else {
          const locationEntity = await this.locationRepository.findOne({
            where: { name: locationName },
          });

          if (!locationEntity) {
            throw new ManualValidationError('error.rules.NOT_EXIST', {
              error: 'NOT_EXIST',
              key: 'locationName',
              property: isHeader ? 'locationName' : locationDepartureName,
            });
          }

          collectionItem.locationId = locationEntity.id;
          locationCached.set(locationName, locationEntity.id);
        }
        // ----------------------------------------------------------------

        // supplier
        const supplierName = receivedItem[supplierNameHeader];
        if (!supplierName) {
          throw new ManualValidationError('error.rules.IS_NOT_EMPTY', {
            error: 'IS_NOT_EMPTY',
            key: 'supplierName',
            property: isHeader ? 'supplierName' : supplierNameHeader,
          });
        }

        if (supplierCached.get(supplierName)) {
          collectionItem.supplierId = supplierCached.get(supplierName);
        } else {
          const supplierEntity = await this.supplierRepository.findOne({
            where: { name: supplierName },
          });

          if (!supplierEntity) {
            throw new ManualValidationError('error.rules.NOT_EXIST', {
              error: 'NOT_EXIST',
              key: 'supplierName',
              property: isHeader ? 'supplierName' : supplierNameHeader,
            });
          }

          collectionItem.supplierId = supplierEntity.id;
          supplierCached.set(supplierName, supplierEntity.id);
        }
        // ----------------------------------------------------------------

        collectionItem.lotNo = receivedItem[lotNumberHeader];
        collectionItem.expirationDate = receivedItem[expirationDateHeader];

        // operationTypeName
        const operationTypeName = receivedItem[operationTypeNameHeader];
        if (!operationTypeName) {
          throw new ManualValidationError('error.rules.IS_NOT_EMPTY', {
            error: 'IS_NOT_EMPTY',
            key: 'operationTypeName',
            property: isHeader ? 'operationTypeName' : operationTypeNameHeader,
          });
        }

        if (operationTypeCached.get(operationTypeName)) {
          collectionItem.operationTypeId =
            operationTypeCached.get(operationTypeName);
        } else {
          const operationTypeEntity =
            await this.operationTypeRepository.findOne({
              where: { name: operationTypeName },
            });

          if (
            !operationTypeEntity ||
            operationTypeEntity.category !== Category.RECEIVING
          ) {
            throw new ManualValidationError('error.rules.NOT_EXIST', {
              error: 'NOT_EXIST',
              key: 'operationTypeName',
              property: isHeader
                ? 'operationTypeName'
                : operationTypeNameHeader,
            });
          }

          collectionItem.operationTypeId = operationTypeEntity.id;
          operationTypeCached.set(operationTypeName, operationTypeEntity.id);
        }
        // ----------------------------------------------------------------

        collectionItem.itemSerial = receivedItem[itemSerialHeader];
        collectionItem.quantity = receivedItem[quantityHeader];
        collectionItem.status =
          receivedItem[statusHeader] ?? StockStatus.NORMAL; // 재고상태가 없으면 기본 값 적용
        collectionItem.remark = receivedItem[remarkHeader];

        indexedCollectionItems.push({
          index: parseInt(index),
          collectionItem,
        });
      } catch (error) {
        if (error instanceof ManualValidationError) {
          failures.push({
            index: parseInt(index),
            children: [
              {
                value: '',
                property: error.extra?.property,
                children: [],
                constraints: {
                  [error.extra?.error?.toLowerCase() as string]: this.i18n.t(
                    error.message,
                    {
                      lang: acceptLanguage,
                      args: {
                        message: error.extra?.key,
                      },
                    },
                  ),
                },
              },
            ],
            constraints: {},
          });
        } else {
          console.error('An unexpected error occurred:', error);

          throw new InternalServerErrorException(error);
        }
      }

      const transactionEvent = new TransactionEvent();
      transactionEvent.id = request.header('x-client-id') as string;
      transactionEvent.name = 'Import Data Parsing';
      transactionEvent.total = total;
      transactionEvent.processed = parseInt(index) + 1;
      this.eventEmitter.emit('transaction.received', transactionEvent);
    }

    itemCodeCached.clear();
    locationCached.clear();
    supplierCached.clear();
    operationTypeCached.clear();

    const result = await this.transactionService.receive(
      acceptLanguage,
      request.header('x-client-id') as string,
      indexedCollectionItems,
    );

    await this.fileService.moveFile(file, request.params.domain, 'receiving');

    const combinedResults = [...failures, ...result];

    return {
      requested: receivedItems.length ?? 0,
      result: combinedResults,
    };
  }

  @Post('movement:import')
  @ApiOperation({ summary: '파일이동' })
  @UseInterceptors(new PartialResponseInterceptor())
  @UseInterceptors(FileInterceptor('file'))
  async importMovementData(
    @Req() request: Request,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MAX_UPLOAD_SIZE })], // 10MB
      }),
    )
    file: Express.Multer.File,
    @Body('header_mapping') headerMapping: string,
    @Body('is_header', ParseBoolPipe) isHeader: boolean,
  ) {
    const headers = JSON.parse(headerMapping);
    const acceptLanguage = request.header('accept-Language') as string;
    const failures: any[] = [];

    const {
      locationDepartureName: locationDepartureName,
      locationArrivalName: locationArrivalNameHeader,
      itemCode: itemCodeHeader,
      // itemName: itemNameHeader,
      // itemProperty: itemPropertyHeader,
      // itemSerial: itemSerialHeader,
      // supplierName: supplierNameHeader,
      lotNumber: lotNumberHeader,
      // expirationDate: expirationDateHeader,
      operationTypeName: operationTypeNameHeader,
      quantity: quantityHeader,
      status: statusHeader,
      remark: remarkHeader,
    } = headers;

    const fileData = await this.fileService.fileToJson(file, isHeader);
    const indexedCollectionItems: {
      index: number;
      collectionItem: MoveInventoryItemDto;
    }[] = [];

    // 모든 데이터를 DB 조회하지 않고, 중복 된 데이터인 경우 caching 된 데이터를 활용
    const itemCodeCached = new CachingHandler();
    const locationCached = new CachingHandler();
    const operationTypeCached = new CachingHandler();

    const movedItems = await this.preProcessing(fileData);
    const total = movedItems.length;

    for (const index in movedItems) {
      const collectionItem = new MoveInventoryItemDto();
      const movedItem = movedItems[index]['collectionItem'];

      try {
        // locationDepartureName
        const departureLocationName = movedItem[locationDepartureName];

        if (!departureLocationName) {
          throw new ManualValidationError('error.rules.IS_NOT_EMPTY', {
            error: 'IS_NOT_EMPTY',
            key: 'locationDepartureName',
            property: isHeader
              ? 'locationDepartureName'
              : locationDepartureName,
          });
        }

        if (locationCached.get(departureLocationName)) {
          collectionItem.locationDepartureId = locationCached.get(
            departureLocationName,
          );
        } else {
          const departureLocationEntity = await this.locationRepository.findOne(
            {
              where: { name: departureLocationName },
            },
          );

          if (!departureLocationEntity) {
            throw new ManualValidationError('error.rules.NOT_EXIST', {
              error: 'IS_NOT_EMPTY',
              key: 'locationDepartureName',
              property: isHeader
                ? 'locationDepartureName'
                : locationDepartureName,
            });
          }

          collectionItem.locationDepartureId = departureLocationEntity.id;
          locationCached.set(departureLocationName, departureLocationEntity.id);
        }
        // ----------------------------------------------------------------

        // locationArrivalName
        const arrivalLocationName = movedItem[locationArrivalNameHeader];
        if (!arrivalLocationName) {
          throw new ManualValidationError('error.rules.IS_NOT_EMPTY', {
            error: 'IS_NOT_EMPTY',
            key: 'locationArrivalName',
            property: isHeader
              ? 'locationArrivalName'
              : locationArrivalNameHeader,
          });
        }

        if (locationCached.get(arrivalLocationName)) {
          collectionItem.locationArrivalId =
            locationCached.get(arrivalLocationName);
        } else {
          const locationEntity = await this.locationRepository.findOne({
            where: { name: arrivalLocationName },
          });

          if (!locationEntity) {
            throw new ManualValidationError('error.rules.NOT_EXIST', {
              error: 'NOT_EXIST',
              key: 'locationArrivalName',
              property: isHeader
                ? 'locationArrivalName'
                : locationArrivalNameHeader,
            });
          }

          collectionItem.locationArrivalId = locationEntity.id;
          locationCached.set(arrivalLocationName, locationEntity.id);
        }
        // ----------------------------------------------------------------

        // itemCode
        const itemCode = movedItem[itemCodeHeader];
        if (!itemCode) {
          throw new ManualValidationError('error.rules.IS_NOT_EMPTY', {
            error: 'IS_NOT_EMPTY',
            key: 'itemCode',
            property: isHeader ? 'itemCode' : itemCodeHeader,
          });
        }

        if (itemCodeCached.get(itemCode)) {
          collectionItem.itemId = itemCodeCached.get(itemCode);
        } else {
          const itemCodeEntity = await this.itemCodeRepository.findOne({
            where: { code: itemCode },
          });

          if (!itemCodeEntity) {
            throw new ManualValidationError('error.rules.NOT_EXIST', {
              error: 'NOT_EXIST',
              key: 'itemCode',
              property: isHeader ? 'itemCode' : itemCodeHeader,
            });
          }

          const inventoryItemEntity =
            await this.inventoryItemRepository.findOne({
              where: {
                itemId: itemCodeEntity.itemId,
                locationId: collectionItem.locationDepartureId,
              },
            });

          if (!inventoryItemEntity) {
            throw new ManualValidationError(
              'error.rules.NOT_EXIST_FOR_MOVING',
              {
                error: 'NOT_EXIST_FOR_MOVING',
                key: 'itemCode',
                property: isHeader ? 'itemCode' : itemCodeHeader,
              },
            );
          }

          collectionItem.itemId = inventoryItemEntity.itemId;
          itemCodeCached.set(itemCode, inventoryItemEntity.itemId);
        }
        // ----------------------------------------------------------------

        // operationTypeName
        const operationTypeName = movedItem[operationTypeNameHeader];
        if (!operationTypeName) {
          throw new ManualValidationError('error.rules.IS_NOT_EMPTY', {
            error: 'IS_NOT_EMPTY',
            key: 'operationTypeName',
            property: isHeader ? 'operationTypeName' : operationTypeNameHeader,
          });
        }

        if (operationTypeCached.get(operationTypeName)) {
          collectionItem.operationTypeId =
            operationTypeCached.get(operationTypeName);
        } else {
          const operationTypeEntity =
            await this.operationTypeRepository.findOne({
              where: { name: operationTypeName },
            });

          if (
            !operationTypeEntity ||
            operationTypeEntity.category !== Category.MOVEMENT
          ) {
            throw new ManualValidationError('error.rules.NOT_EXIST', {
              error: 'NOT_EXIST',
              key: 'operationTypeName',
              property: isHeader
                ? 'operationTypeName'
                : operationTypeNameHeader,
            });
          }
          collectionItem.operationTypeId = operationTypeEntity.id;
          operationTypeCached.set(operationTypeName, operationTypeEntity.id);
        }
        // ----------------------------------------------------------------

        // lotNumber
        const lotNumber = movedItem[lotNumberHeader];

        collectionItem.lotId = null;

        if (lotNumber) {
          const lotEntity = await this.lotRepository.findOne({
            where: { number: lotNumber },
          });

          if (!lotEntity) {
            throw new ManualValidationError('error.rules.NOT_EXIST', {
              error: 'NOT_EXIST',
              key: 'lotNumber',
              property: isHeader ? 'lotNumber' : lotNumberHeader,
            });
          }

          collectionItem.lotId = lotEntity.id;
        }
        // ----------------------------------------------------------------

        collectionItem.quantity = movedItem[quantityHeader];
        collectionItem.status = movedItem[statusHeader];
        collectionItem.remark = movedItem[remarkHeader];

        indexedCollectionItems.push({
          index: parseInt(index),
          collectionItem,
        });
      } catch (error) {
        if (error instanceof ManualValidationError) {
          failures.push({
            index: parseInt(index),
            children: [
              {
                value: '',
                property: error.extra?.property,
                children: [],
                constraints: {
                  [error.extra?.error?.toLowerCase() as string]: this.i18n.t(
                    error.message,
                    {
                      lang: acceptLanguage,
                      args: {
                        message: error.extra?.key,
                      },
                    },
                  ),
                },
              },
            ],
            constraints: {},
          });
        } else {
          console.error('An unexpected error occurred:', error);

          throw new InternalServerErrorException(error);
        }
      }

      const transactionEvent = new TransactionEvent();
      transactionEvent.id = request.header('x-client-id') as string;
      transactionEvent.name = 'Import Data Parsing';
      transactionEvent.total = total;
      transactionEvent.processed = parseInt(index) + 1;
      this.eventEmitter.emit('transaction.movement', transactionEvent);
    }

    const result = await this.transactionService.move(
      acceptLanguage,
      request.header('x-client-id') as string,
      indexedCollectionItems,
    );

    await this.fileService.moveFile(file, request.params.domain, 'movement');

    const combinedResults = [...failures, ...result];

    return {
      requested: movedItems.length ?? 0,
      result: combinedResults,
    };
  }

  private async preProcessing<T>(
    data: T[],
  ): Promise<IndexedCollectionItemDto<T>[]> {
    let globalIndex = 0;

    return data.map((collectionItem) => ({
      index: globalIndex++,
      collectionItem: collectionItem as ReceiveInventoryItemDto,
    })) as IndexedCollectionItemDto<T>[];
  }

  @ApiExcludeEndpoint()
  @Post('shipping:action')
  @UseInterceptors(new PartialResponseInterceptor())
  async handleShippingAction(
    @Param('action') action: string,
    @Req() request: Request,
    @Param('warehouseId') warehouseId: number,
    @Body('filters') findTransactionDto: FindTransactionDto,
    @Body('data') updateTransactionDto: UpdateTransactionDto,
  ) {
    if (action === ':allocate-stocks') {
      return await this.allocateToStock(
        request,
        warehouseId,
        findTransactionDto,
      );
    } else if (action === ':deallocate-stocks') {
      return await this.deallocateToStock(findTransactionDto);
    } else if (action === ':batch') {
      return await this.patchBulk(findTransactionDto, updateTransactionDto);
    } else {
      throw new Error('Invalid action');
    }
  }

  @ApiOperation({ summary: '출고지시' })
  @ApiOkResponse()
  async allocateToStock(
    @Req() request: Request,
    @Param('warehouseId') warehouseId: number,
    @Body('filters') findTransactionDto: FindTransactionDto,
  ) {
    // 출고이면서, 작업예정 상태만 출고지시(재고할당) 가능.
    findTransactionDto.category = Category.SHIPPING;
    findTransactionDto.status = SlipStatus.SCHEDULED;

    const paginate = new PaginateDto();
    paginate.sortBy = [['transaction.id', 'ASC']];

    const transactions = await this.transactionService.getManyShippingList(
      findTransactionDto,
      paginate,
    );

    if (!transactions || transactions.length === 0) {
      throw new CustomHttpException(
        {
          error: 'Not Found',
          message: 'ENTITY_NOT_FOUND',
          statusCode: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // 작업 대상 확정: 총 몇개의 대상 주문을 Wave로 생성 할 것인가.
    const targetOrders = findTransactionDto.ordersToProcess
      ? transactions.slice(0, findTransactionDto.ordersToProcess)
      : transactions;

    let inventoryItems =
      await this.inventoryItemService.getAvailableStockList(warehouseId);
    console.log(inventoryItems);
    if (!inventoryItems || inventoryItems.length === 0) {
      throw new CustomHttpException(
        {
          error: 'Not Found',
          message: 'rules.NOT_ENOUGH',
          statusCode: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    inventoryItems = inventoryItems.map((item) => ({
      ...item,
      itemId: parseInt(item.itemId),
      locationId: parseInt(item.locationId),
      lotId: item.lotId ? parseInt(item.lotId) : null,
      availableQuantity: parseInt(item.availableQuantity),
    }));

    // 재고할당 룰
    // 1. zone 확인(선택 된 zone or 전체 zone)
    // 2. shop 확인(선택 된 shop or 전체 shop)
    const stockAllocationRules = await this.stockAllocationRuleRepository.find({
      relations: {
        shipper: true,
        stockAllocationRuleShops: { shop: true },
        stockAllocationRuleZones: { zone: true },
      },
      order: {
        priority: 'ASC',
      },
    });

    const result: any[] = [];
    const transactionsLength = targetOrders.length;

    for (const [i, transaction] of targetOrders.entries()) {
      const transactionEvent = new TransactionEvent();
      transactionEvent.id = request.header('x-client-id') as string;
      transactionEvent.name = 'Allocate Stock Processing';
      transactionEvent.total = transactionsLength;
      transactionEvent.processed = i + 1;
      this.eventEmitter.emit('transaction.allocateToStock', transactionEvent);

      const failure = await this.transactionService.allocateToStock(
        request.header('accept-Language') as string,
        transaction,
        inventoryItems,
        stockAllocationRules,
      );

      if (failure.length > 0) {
        result.push(...failure);
      }
    }

    return {
      requested: targetOrders.length,
      result,
    };
  }

  @ApiOperation({ summary: '출고지시 취소' })
  @ApiOkResponse()
  async deallocateToStock(
    @Body('filters') findTransactionDto: FindTransactionDto,
  ) {
    // 출고이면서, 할당완료 상태만 출고지시 취소(재고할당 취소) 가능.
    findTransactionDto.category = Category.SHIPPING;
    findTransactionDto.status = SlipStatus.ALLOCATED;

    const transactions =
      await this.transactionService.getManyShippingList(findTransactionDto);

    if (!transactions || transactions.length === 0) {
      throw new CustomHttpException(
        {
          error: 'Not Found',
          message: 'ENTITY_NOT_FOUND',
          statusCode: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const result: any[] = [];

    for (const transaction of transactions) {
      await this.transactionService.deallocateToStock(transaction);
    }

    return {
      requested: transactions?.length ?? 0,
      result,
    };
  }

  @Patch('shipping:batch')
  async patchBulk(
    @Body('filters') findTransactionDto: FindTransactionDto,
    @Body('data') updateTransactionDto: UpdateTransactionDto,
  ) {
    const transactions =
      await this.transactionService.getManyShippingList(findTransactionDto);

    if (!transactions || transactions.length === 0) {
      throw new CustomHttpException(
        {
          error: 'Not Found',
          message: 'ENTITY_NOT_FOUND',
          statusCode: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return this.transactionService.patchBulk(
      transactions,
      updateTransactionDto,
    );
  }

  @Patch('shipping/:id')
  async patch(
    @Param('id') id: number,
    @Body('data') updateTransactionDto: UpdateTransactionDto,
  ) {
    const transaction = await this.transactionService.findOne(id);

    if (!transaction) {
      throw new CustomHttpException(
        {
          error: 'Not Found',
          message: 'ENTITY_NOT_FOUND',
          statusCode: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return this.transactionService.patch(transaction, updateTransactionDto);
  }
}

class CachingHandler {
  private cache: { [key: string]: any } = {};

  get(key: string) {
    return this.cache[key] ?? null;
  }

  set(key: string, value: any) {
    this.cache[key] = value;
  }

  clear() {
    this.cache = {};
  }
}
