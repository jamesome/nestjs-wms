import { Test, TestingModule } from '@nestjs/testing';
import { ObjectLiteral, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { SlipStatus, StockStatus } from '../enum';
import { CONNECTION } from 'src/common/constants';
import { Transaction } from './entities/transaction.entity';
import { I18nService } from 'nestjs-i18n';
import { TransactionService } from './transaction.service';
import { LotService } from '../lot/lot.service';
import { ItemService } from '../item/item.service';
import { TransactionListener } from './listeners/transaction.listener';
import { EventsModule } from 'src/events/events.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ReceiveItemDto } from '../inventory-item/dto/receive-item.dto';
import { IndexedCollectionItemDto } from '../inventory-item/dto/index-collection-item.dto';
import { FileService } from 'src/services/file.service';
import { MoveItemDto } from '../inventory-item/dto/move-item.dto';
import { InstructShippingTransactionDto } from './dto/instruct-shipping-transaction.dto';

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnThis(),
};

const mockQueryRunner = {
  connect: jest.fn().mockReturnThis(),
  startTransaction: jest.fn().mockReturnThis(),
  commitTransaction: jest.fn().mockReturnThis(),
  rollbackTransaction: jest.fn().mockReturnThis(),
  release: jest.fn().mockReturnThis(),
};

const mockDataSource = {
  getRepository: jest.fn().mockReturnValue(mockRepository),
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
};

type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('TransactionService', () => {
  let service: TransactionService;
  let transactionRepository: MockRepository<Transaction>;

  beforeEach(async () => {
    const mockRequest = {
      headers: {
        'accept-language': 'kr',
      },
    };

    const mockI18nService = {
      t: jest.fn().mockReturnValue('translated string'),
      validate: jest.fn().mockReturnValue([]),
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
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    transactionRepository = mockDataSource.getRepository(Transaction);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined', () => {
    expect(transactionRepository).toBeDefined();
  });

  describe('receive()', () => {
    it('should be receive', async () => {
      const acceptLanguage = 'kr';
      const xClientId = 'aaa-bbb-ccc-ddd';

      const itemId1 = 1;
      const itemId2 = 2;
      const locationId = 12;
      const quantity = 3;
      const status = StockStatus.ABNORMAL;
      const receiveItemDto: IndexedCollectionItemDto<ReceiveItemDto>[] = [
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

      const queryRunner = mockDataSource.createQueryRunner();
      queryRunner.manager = {
        update: jest.fn(),
        insert: jest.fn().mockImplementation(() => {
          return Promise.resolve({
            identifiers: [{ id: 1 }],
          });
        }),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
      };

      transactionRepository.findOne
        ?.mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          itemId: itemId2,
          locationId: locationId,
          status: status,
          quantity: quantity,
        });

      await service.receive(acceptLanguage, xClientId, receiveItemDto);

      expect(queryRunner.manager.insert).toHaveBeenCalledTimes(4);
      expect(queryRunner.manager.update).toHaveBeenCalledTimes(0);

      expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      // expect(queryRunner.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('move()', () => {
    it('should be move', async () => {
      const acceptLanguage = 'kr';
      const xClientId = 'aaa-bbb-ccc-ddd';

      const itemId1 = 1;
      const itemId2 = 2;
      const locationDepartureId = 1;
      const locationArrivalId = 2;
      const quantity = 3;
      const status = StockStatus.ABNORMAL;
      const moveItemDto: IndexedCollectionItemDto<MoveItemDto>[] = [
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

      const queryRunner = mockDataSource.createQueryRunner();
      queryRunner.manager = {
        update: jest.fn(),
        delete: jest.fn(),
        insert: jest.fn().mockImplementation(() => {
          return Promise.resolve({
            identifiers: [{ id: 1 }],
          });
        }),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
      };

      transactionRepository.findOne
        ?.mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          itemId: itemId2,
          locationDepartureId,
          locationArrivalId,
          status: status,
          quantity: quantity,
        });

      await service.move(acceptLanguage, xClientId, moveItemDto);

      expect(queryRunner.manager.insert).toHaveBeenCalledTimes(4);
      expect(queryRunner.manager.update).toHaveBeenCalledTimes(0);

      expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(2);
      // expect(queryRunner.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('instructShipping()', () => {
    it('should be instructShipping', async () => {
      const acceptLanguage = 'kr';

      const itemId1 = 1;
      const itemId2 = 2;
      const locationDepartureId = 1;
      const locationArrivalId = 2;
      const quantity = 3;
      const status = StockStatus.ABNORMAL;
      const instructItemDto: InstructShippingTransactionDto[] = [
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
          status: SlipStatus.SCHEDULED,
        },
      ];
      const transactionNumber = '11111-22222';
      const zoneIds = [1, 2];

      const queryRunner = mockDataSource.createQueryRunner();
      queryRunner.manager = {
        update: jest.fn(),
        delete: jest.fn(),
        insert: jest.fn().mockImplementation(() => {
          return Promise.resolve({
            identifiers: [{ id: 1 }],
          });
        }),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
      };

      transactionRepository.findOne
        ?.mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          itemId: itemId2,
          locationDepartureId,
          locationArrivalId,
          status: status,
          quantity: quantity,
        });

      await service.instructShipping(
        acceptLanguage,
        transactionNumber,
        zoneIds,
        instructItemDto,
      );

      expect(queryRunner.manager.insert).toHaveBeenCalledTimes(5);
      expect(queryRunner.manager.update).toHaveBeenCalledTimes(0);

      expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(2);
      // expect(queryRunner.release).toHaveBeenCalledTimes(1);
    });
  });
});
