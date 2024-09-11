import { Test, TestingModule } from '@nestjs/testing';
import { StockStatus } from '../enum';
import { CONNECTION } from 'src/common/constants';
import { Transaction } from './entities/transaction.entity';
import { I18nService } from 'nestjs-i18n';
import { TransactionService } from './transaction.service';
import { LotService } from '../lot/lot.service';
import { ItemService } from '../item/item.service';
import { TransactionListener } from './listeners/transaction.listener';
import { EventsModule } from 'src/events/events.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ReceiveInventoryItemDto } from '../inventory-item/dto/receive-inventory-item.dto';
import { IndexedCollectionItemDto } from '../inventory-item/dto/index-collection-item.dto';
import { FileService } from 'src/services/file.service';
import { MoveInventoryItemDto } from '../inventory-item/dto/move-inventory-item.dto';
import { CreateShippingTransactionDto } from './dto/create-shipping-transaction.dto';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventoryItemService } from '../inventory-item/inventory-item.service';
// import { StockAllocated } from '../stock-allocated/entities/stock-allocated.entity';

describe('TransactionService', () => {
  const acceptLanguage = 'kr';
  let service: TransactionService;
  // let inventoryItemService: InventoryItemService;
  let transactionRepository: jest.Mocked<Repository<Transaction>>;
  // let stockAllocatedRepository: jest.Mocked<Repository<StockAllocated>>;
  let mockQueryRunner;
  let mockDataSource;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnThis(),
    };

    mockQueryRunner = {
      connect: jest.fn().mockReturnThis(),
      startTransaction: jest.fn().mockReturnThis(),
      commitTransaction: jest.fn().mockReturnThis(),
      rollbackTransaction: jest.fn().mockReturnThis(),
      release: jest.fn().mockReturnThis(),
      manager: {
        update: jest.fn(),
        save: jest.fn(),
        insert: jest.fn().mockImplementation(() => {
          return Promise.resolve({
            identifiers: [{ id: 1 }],
          });
        }),
      },
    };

    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    const mockTransactionRepository = {
      find: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnThis(),
    };

    const mockI18nService = {
      t: jest.fn(),
      validate: jest.fn().mockReturnValue([]),
    };

    const mockInventoryItemService = {
      getAvailableStockList: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [EventsModule, EventEmitterModule.forRoot()],
      providers: [
        TransactionService,
        LotService,
        ItemService,
        FileService,
        TransactionListener,
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
        {
          provide: InventoryItemService,
          useValue: mockInventoryItemService,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    // inventoryItemService =
    //   module.get<InventoryItemService>(InventoryItemService);
    transactionRepository = module.get(getRepositoryToken(Transaction));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined', () => {
    expect(transactionRepository).toBeDefined();
  });

  describe('receive()', () => {
    it('should be receive', async () => {
      const xClientId = 'aaa-bbb-ccc-ddd';

      const itemId1 = 1;
      const itemId2 = 2;
      const locationId = 12;
      const quantity = 3;
      const status = StockStatus.ABNORMAL;
      const receiveInventoryItemDto: IndexedCollectionItemDto<ReceiveInventoryItemDto>[] =
        [
          {
            index: 0,
            collectionItem: {
              itemId: itemId1,
              locationId: locationId,
              supplierId: 1,
              operationTypeId: 1,
              quantity: quantity,
              remark: '',
              lotNo: null,
              itemSerial: {
                serialNo: '',
              },
              status: status,
            },
          },
          {
            index: 1,
            collectionItem: {
              itemId: itemId2,
              locationId: locationId,
              supplierId: 1,
              operationTypeId: 1,
              quantity: quantity,
              remark: '',
              lotNo: null,
              itemSerial: {
                serialNo: '',
              },
              status: status,
            },
          },
        ];

      // transactionRepository.findOne
      //   ?.mockResolvedValueOnce(null)
      //   .mockResolvedValueOnce({
      //     itemId: itemId2,
      //     locationId: locationId,
      //     status: status,
      //     quantity: quantity,
      //   });

      await service.receive(acceptLanguage, xClientId, receiveInventoryItemDto);

      expect(mockQueryRunner.manager.save).toHaveBeenCalledTimes(6);
      expect(mockQueryRunner.manager.update).toHaveBeenCalledTimes(0);
    });
  });

  describe('move()', () => {
    it('should be move', async () => {
      const xClientId = 'aaa-bbb-ccc-ddd';

      const itemId1 = 1;
      const itemId2 = 2;
      const locationDepartureId = 1;
      const locationArrivalId = 2;
      const quantity = 3;
      const status = StockStatus.ABNORMAL;
      const moveInventoryItemDto: IndexedCollectionItemDto<MoveInventoryItemDto>[] =
        [
          {
            index: 0,
            collectionItem: {
              itemId: itemId1,
              locationDepartureId,
              locationArrivalId,
              operationTypeId: 1,
              quantity: quantity,
              remark: '',
              status: status,
            },
          },
          {
            index: 1,
            collectionItem: {
              itemId: itemId2,
              locationDepartureId,
              locationArrivalId,
              operationTypeId: 1,
              quantity: quantity,
              remark: '',
              status: status,
            },
          },
        ];

      // transactionRepository.findOne
      //   ?.mockResolvedValueOnce(null)
      //   .mockResolvedValueOnce({
      //     itemId: itemId2,
      //     locationDepartureId,
      //     locationArrivalId,
      //     status: status,
      //     quantity: quantity,
      //   });

      await service.move(acceptLanguage, xClientId, moveInventoryItemDto);

      expect(mockQueryRunner.manager.insert).toHaveBeenCalledTimes(2);
      expect(mockQueryRunner.manager.update).toHaveBeenCalledTimes(0);
    });
  });

  describe('instructShipping()', () => {
    it('should be instructShipping', async () => {
      const itemId1 = 1;
      const itemId2 = 2;
      // const locationDepartureId = 1;
      // const locationArrivalId = 2;
      // const quantity = 3;
      // const status = StockStatus.ABNORMAL;
      const instructItemDto: CreateShippingTransactionDto[] = [
        {
          slipNumber: '20240725-000028-3',
          order: {
            transactionId: 1,
            number: 'S240719084039',
            shopId: 1,
            recipient: '카리나',
            contact: '01011112222',
            postCode: '04209',
            address: '서울특별시 마포구 만리재로 47 (신공덕동, 공덕코어)',
            detailAddress: '1',
            invoiceNumber: '123123aaa',
            orderedAt: new Date('2024-07-19 00:00:00'),
          },
          items: [
            {
              transactionId: 1,
              itemId: itemId1,
              quantity: 2,
              price: 10000,
            },
            {
              transactionId: 2,
              itemId: itemId2,
              quantity: 1,
              price: 4545454,
            },
          ],
        },
      ];
      const transactionNumber = '11111-22222';

      // transactionRepository.findOne
      //   ?.mockResolvedValueOnce(null)
      //   .mockResolvedValueOnce({
      //     itemId: itemId2,
      //     locationDepartureId,
      //     locationArrivalId,
      //     status: status,
      //     quantity: quantity,
      //   });

      await service.instructShipping(
        acceptLanguage,
        transactionNumber,
        instructItemDto,
      );

      expect(mockQueryRunner.manager.save).toHaveBeenCalledTimes(3);
      expect(mockQueryRunner.manager.update).toHaveBeenCalledTimes(0);
    });
  });

  // describe('allocateToStock()', () => {
  //   // it('should successfully allocate stock when inventory is sufficient', async () => {
  //   //   // Given: 테스트에 필요한 더미 데이터 준비
  //   //   const transaction = {
  //   //     transactionB2cOrder: { shopId: 1 },
  //   //     transactionItems: [
  //   //       { id: 1, itemId: 1, quantity: 10, item: { name: 'Item 1' } },
  //   //       { id: 2, itemId: 2, quantity: 5, item: { name: 'Item 2' } },
  //   //     ],
  //   //     slipNumber: 'SLIP123',
  //   //     status: SlipStatus.SCHEDULED,
  //   //     createdAt: new Date(),
  //   //   };
  //   //   const inventoryItems = [
  //   //     { itemId: 1, availableQuantity: 20, locationId: 1, lotId: 1 },
  //   //     { itemId: 2, availableQuantity: 10, locationId: 2, lotId: 2 },
  //   //   ];
  //   //   const stockAllocationRules = [];
  //   //   // inventoryItemService.getAvailableStockList.mockResolvedValue(1);
  //   //   // When: 할당 로직 호출
  //   //   const result = await service.allocateToStock(
  //   //     acceptLanguage,
  //   //     transaction,
  //   //     inventoryItems,
  //   //     stockAllocationRules,
  //   //   );
  //   //   // Then: 재고가 충분하므로 실패 없이 할당이 성공해야 함
  //   //   expect(result).toEqual([]);
  //   //   expect(transaction.status).toEqual(SlipStatus.ALLOCATED);
  //   //   expect(stockAllocatedRepository.save).toHaveBeenCalledTimes(1);
  //   //   expect(transactionRepository.save).toHaveBeenCalledWith(transaction);
  //   // });
  //   // it('should be allocateToStock', async () => {
  //   //   // given
  //   //   const transactions = JSON.parse(
  //   //     fs.readFileSync(
  //   //       path.resolve('test/fixtures/transaction/2024-09-05.json'),
  //   //       'utf8',
  //   //     ),
  //   //   );
  //   //   let inventoryItems: any[] = JSON.parse(
  //   //     fs.readFileSync(
  //   //       path.resolve('test/fixtures/inventory-item/2024-09-05.json'),
  //   //       'utf8',
  //   //     ),
  //   //   );
  //   //   const stockAllocationRules: any[] = JSON.parse(
  //   //     fs.readFileSync(
  //   //       path.resolve('test/fixtures/stock-allocation-rule/2024-09-05.json'),
  //   //       'utf8',
  //   //     ),
  //   //   );
  //   //   inventoryItems = inventoryItems.map((item) => ({
  //   //     ...item,
  //   //     itemId: item.itemId,
  //   //     locationId: item.locationId,
  //   //     lotId: item.lotId ? item.lotId : null,
  //   //     availableQuantity: item.availableQuantity,
  //   //   }));
  //   //   // transactionRepository.findOne
  //   //   //   ?.mockResolvedValueOnce(null)
  //   //   //   .mockResolvedValueOnce({
  //   //   //     itemId: itemId2,
  //   //   //     locationDepartureId,
  //   //   //     locationArrivalId,
  //   //   //     status: status,
  //   //   //     quantity: quantity,
  //   //   //   });
  //   //   for (const transaction of transactions.data) {
  //   //     await service.allocateToStock(
  //   //       acceptLanguage,
  //   //       transaction,
  //   //       inventoryItems,
  //   //       stockAllocationRules,
  //   //     );
  //   //   }
  //   // });
  // });
});
