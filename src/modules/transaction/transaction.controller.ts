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
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiHeader,
  ApiNoContentResponse,
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
import { ItemCode } from '../item-code/entities/item-code.entity';
import { Location } from '../location/entities/location.entity';
import { Supplier } from '../supplier/entities/supplier.entity';
import { OperationType } from '../operation-type/entities/operation-type.entity';
import { Category, StockStatus } from '../enum';
import { TransactionEvent } from './events/transaction.event';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FindTransactionDto } from './dto/find-transaction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { IndexedCollectionItemDto } from '../inventory-item/dto/index-collection-item.dto';
import { ReceiveItemDto } from '../inventory-item/dto/receive-item.dto';
import { MoveItemDto } from '../inventory-item/dto/move-item.dto';
import { Lot } from '../lot/entities/lot.entity';
import { InstructShippingTransactionDto } from './dto/instruct-shipping-transaction.dto';
import { ManualValidationError } from 'src/common/errors/manual-validation-error';
import { InventoryItem } from '../inventory-item/entities/inventory-item.entity';

@Controller('transactions')
@ApiTags('Transaction API')
@ApiHeader({
  name: 'Accept-Language',
  description: '국가코드를 통해 국제화 된 언어 노출',
})
export class TransactionController {
  private itemCodeRepository: Repository<ItemCode>;
  private locationRepository: Repository<Location>;
  private supplierRepository: Repository<Supplier>;
  private operationTypeRepository: Repository<OperationType>;
  private lotRepository: Repository<Lot>;
  private inventoryItemRepository: Repository<InventoryItem>;

  constructor(
    @Inject(CONNECTION) private readonly dataSource: DataSource,
    private readonly i18n: I18nService,
    private readonly transactionService: TransactionService,
    private readonly fileService: FileService,
    private eventEmitter: EventEmitter2,
  ) {
    this.itemCodeRepository = this.dataSource.getRepository(ItemCode);
    this.locationRepository = this.dataSource.getRepository(Location);
    this.supplierRepository = this.dataSource.getRepository(Supplier);
    this.operationTypeRepository = this.dataSource.getRepository(OperationType);
    this.lotRepository = this.dataSource.getRepository(Lot);
    this.inventoryItemRepository = this.dataSource.getRepository(InventoryItem);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Created' })
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    return await this.transactionService.create(createTransactionDto);
  }

  @Post('receiving')
  @ApiOperation({ summary: '입고' })
  @ApiCreatedResponse({ description: 'Created' })
  @UseInterceptors(new PartialResponseInterceptor())
  async receive(@Req() request: Request, @Body('data') data: ReceiveItemDto[]) {
    let globalIndex = 0;

    const receivedItems = data.map((collectionItem) => ({
      index: globalIndex++,
      collectionItem: plainToInstance(ReceiveItemDto, collectionItem),
    }));

    return await this.transactionService.receive(
      request.header('accept-Language') as string,
      request.header('x-client-id') as string,
      receivedItems,
    );
  }

  @Post('movement')
  @ApiOperation({ summary: '이동' })
  @ApiCreatedResponse({ description: 'Created' })
  @UseInterceptors(new PartialResponseInterceptor())
  async move(@Req() request: Request, @Body('data') data: MoveItemDto[]) {
    let globalIndex = 0;

    const movedItems = data.map((collectionItem) => ({
      index: globalIndex++,
      collectionItem: plainToInstance(MoveItemDto, collectionItem),
    }));

    return await this.transactionService.move(
      request.header('accept-Language') as string,
      request.header('x-client-id') as string,
      movedItems,
    );
  }

  @Post('shipping-instruct')
  @ApiOperation({ summary: '출고지시' })
  @ApiCreatedResponse({ description: 'Created' })
  @UseInterceptors(new PartialResponseInterceptor())
  async instructShipping(
    @Req() request: Request,
    @Body('transaction_number') transactionNumber: string,
    @Body('zone_ids') zoneIds: number[],
    @Body('data') data: InstructShippingTransactionDto[],
  ) {
    const instructedItems = plainToInstance(
      InstructShippingTransactionDto,
      data,
    );

    return await this.transactionService.instructShipping(
      request.header('accept-Language') as string,
      transactionNumber,
      zoneIds,
      instructedItems,
    );
  }

  // @Post('shipping')
  // @ApiOperation({ summary: '출고' })
  // @ApiCreatedResponse({ description: 'Created' })
  // @UseInterceptors(new PartialResponseInterceptor())
  // async ship(@Req() request: Request, @Body('data') data: ShipItemDto[]) {
  //   return await this.transactionService.ship(request, data);
  // }

  @Get()
  async findAll(
    @Paginate() query: PaginateQuery,
    @Query() findTransactionDto: FindTransactionDto,
  ) {
    return await this.transactionService.findAll(query, findTransactionDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Query('include') include: string) {
    return await this.transactionService.findOne(id, include);
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
    @Body('header_mapping') headerMapping: string,
    @Body('is_header', ParseBoolPipe) isHeader: boolean,
  ) {
    const headers = JSON.parse(headerMapping);
    const acceptLanguage = request.header('accept-Language') as string;
    const failures: any[] = [];

    const {
      location_departure_name: locationDepartureName,
      // location_arrival_name: locationArrivalNameHeader,
      item_code: itemCodeHeader,
      // item_name: itemNameHeader,
      // item_property: itemPropertyHeader,
      item_serial: itemSerialHeader,
      supplier_name: supplierNameHeader,
      lot_number: lotNumberHeader,
      expiration_date: expirationDateHeader,
      operation_type_name: operationTypeNameHeader,
      quantity: quantityHeader,
      status: statusHeader,
      remark: remarkHeader,
    } = headers;

    const fileData = await this.fileService.fileToJson(file, isHeader);
    const indexedCollectionItems: {
      index: number;
      collectionItem: ReceiveItemDto;
    }[] = [];

    // 모든 데이터를 DB 조회하지 않고, 중복 된 데이터인 경우 caching 된 데이터를 활용
    const itemCodeCached = new CachingHandler();
    const locationCached = new CachingHandler();
    const supplierCached = new CachingHandler();
    const operationTypeCached = new CachingHandler();

    const receivedItems = await this.preProcessing(fileData);
    const total = receivedItems.length;
    console.log(receivedItems);
    for (const index in receivedItems) {
      const collectionItem = new ReceiveItemDto();
      const receivedItem = receivedItems[index]['collectionItem'];

      try {
        // itemCode
        const itemCode = receivedItem[itemCodeHeader];
        if (!itemCode) {
          throw new ManualValidationError('error.rules.IS_NOT_EMPTY', {
            error: 'IS_NOT_EMPTY',
            key: 'item_code',
            property: isHeader ? 'item_code' : itemCodeHeader,
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
              key: 'item_code',
              property: isHeader ? 'item_code' : itemCodeHeader,
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
            key: 'location_departure_name',
            property: isHeader
              ? 'location_departure_name'
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
              key: 'location_name',
              property: isHeader ? 'location_name' : locationDepartureName,
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
            key: 'supplier_name',
            property: isHeader ? 'supplier_name' : supplierNameHeader,
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
              key: 'supplier_name',
              property: isHeader ? 'supplier_name' : supplierNameHeader,
            });
          }

          collectionItem.supplierId = supplierEntity.id;
          supplierCached.set(supplierName, supplierEntity.id);
        }
        // ----------------------------------------------------------------

        collectionItem.lotNo = receivedItem[lotNumberHeader];
        collectionItem.expirationDate = receivedItem[expirationDateHeader];

        // operation_type_name
        const operationTypeName = receivedItem[operationTypeNameHeader];
        if (!operationTypeName) {
          throw new ManualValidationError('error.rules.IS_NOT_EMPTY', {
            error: 'IS_NOT_EMPTY',
            key: 'operation_type_name',
            property: isHeader
              ? 'operation_type_name'
              : operationTypeNameHeader,
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
              key: 'operation_type_name',
              property: isHeader
                ? 'operation_type_name'
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
    return combinedResults.length ? combinedResults : '';
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
      location_departure_name: locationDepartureName,
      location_arrival_name: locationArrivalNameHeader,
      item_code: itemCodeHeader,
      // item_name: itemNameHeader,
      // item_property: itemPropertyHeader,
      // item_serial: itemSerialHeader,
      // supplier_name: supplierNameHeader,
      lot_number: lotNumberHeader,
      // expiration_date: expirationDateHeader,
      operation_type_name: operationTypeNameHeader,
      quantity: quantityHeader,
      status: statusHeader,
      remark: remarkHeader,
    } = headers;

    const fileData = await this.fileService.fileToJson(file, isHeader);
    const indexedCollectionItems: {
      index: number;
      collectionItem: MoveItemDto;
    }[] = [];

    // 모든 데이터를 DB 조회하지 않고, 중복 된 데이터인 경우 caching 된 데이터를 활용
    const itemCodeCached = new CachingHandler();
    const locationCached = new CachingHandler();
    const operationTypeCached = new CachingHandler();

    const movedItems = await this.preProcessing(fileData);
    const total = movedItems.length;

    for (const index in movedItems) {
      const collectionItem = new MoveItemDto();
      const movedItem = movedItems[index]['collectionItem'];

      try {
        // locationDepartureName
        const departureLocationName = movedItem[locationDepartureName];

        if (!departureLocationName) {
          throw new ManualValidationError('error.rules.IS_NOT_EMPTY', {
            error: 'IS_NOT_EMPTY',
            key: 'location_departure_name',
            property: isHeader
              ? 'location_departure_name'
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
              key: 'location_departure_name',
              property: isHeader
                ? 'location_departure_name'
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
            key: 'location_arrival_name',
            property: isHeader
              ? 'location_arrival_name'
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
              key: 'location_arrival_name',
              property: isHeader
                ? 'location_arrival_name'
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
            key: 'item_code',
            property: isHeader ? 'item_code' : itemCodeHeader,
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
              key: 'item_code',
              property: isHeader ? 'item_code' : itemCodeHeader,
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
                key: 'item_code',
                property: isHeader ? 'item_code' : itemCodeHeader,
              },
            );
          }

          collectionItem.itemId = inventoryItemEntity.itemId;
          itemCodeCached.set(itemCode, inventoryItemEntity.itemId);
        }
        // ----------------------------------------------------------------

        // operation_type_name
        const operationTypeName = movedItem[operationTypeNameHeader];
        if (!operationTypeName) {
          throw new ManualValidationError('error.rules.IS_NOT_EMPTY', {
            error: 'IS_NOT_EMPTY',
            key: 'operation_type_name',
            property: isHeader
              ? 'operation_type_name'
              : operationTypeNameHeader,
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
              key: 'operation_type_name',
              property: isHeader
                ? 'operation_type_name'
                : operationTypeNameHeader,
            });
          }
          collectionItem.operationTypeId = operationTypeEntity.id;
          operationTypeCached.set(operationTypeName, operationTypeEntity.id);
        }
        // ----------------------------------------------------------------

        // lot_number
        const lotNumber = movedItem[lotNumberHeader];

        collectionItem.lotId = null;

        if (lotNumber) {
          const lotEntity = await this.lotRepository.findOne({
            where: { number: lotNumber },
          });

          if (!lotEntity) {
            throw new ManualValidationError('error.rules.NOT_EXIST', {
              error: 'NOT_EXIST',
              key: 'lot_number',
              property: isHeader ? 'lot_number' : lotNumberHeader,
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
    return combinedResults.length ? combinedResults : '';
  }

  private async preProcessing<T>(
    data: T[],
  ): Promise<IndexedCollectionItemDto<T>[]> {
    let globalIndex = 0;

    return data.map((collectionItem) => ({
      index: globalIndex++,
      collectionItem: collectionItem as ReceiveItemDto,
    })) as IndexedCollectionItemDto<T>[];
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
