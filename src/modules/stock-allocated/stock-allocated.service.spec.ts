import { Test, TestingModule } from '@nestjs/testing';
import { CONNECTION } from 'src/common/constants';
import { SlipStatus } from '../enum';
import { StockAllocated } from './entities/stock-allocated.entity';
import { StockAllocatedService } from './stock-allocated.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createTransaction } from 'src/database/factories/transaction.factory';
import { createTransactionItem } from 'src/database/factories/transaction-item.factory';
import { Repository } from 'typeorm';

const mockWarehouseRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockDataSource = {
  getRepository: jest.fn().mockReturnValue(mockWarehouseRepository),
};

describe('StockAllocated', () => {
  let service: StockAllocatedService;
  let stockAllocatedRepository: jest.Mocked<Repository<StockAllocated>>;

  beforeEach(async () => {
    const mockStockAllocatedRepository = {
      find: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockAllocatedService,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
        {
          provide: getRepositoryToken(StockAllocated),
          useValue: mockStockAllocatedRepository,
        },
      ],
    }).compile();

    service = module.get<StockAllocatedService>(StockAllocatedService);
    stockAllocatedRepository = module.get(getRepositoryToken(StockAllocated));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('patch', () => {
    it('should update status when status is provided', async () => {
      const transaction = createTransaction();
      const transactionItem = createTransactionItem();
      const stockAllocated = new StockAllocated();
      const updateStockAllocatedDto = { status: 'allocated' as SlipStatus };

      transactionItem.transaction = transaction;
      stockAllocated.transactionItem = transactionItem;

      jest
        .spyOn(stockAllocatedRepository, 'save')
        .mockResolvedValue(stockAllocated);

      await service.patch(stockAllocated, updateStockAllocatedDto);

      expect(stockAllocated.transactionItem.status).toBe('ALLOCATED');
    });

    it('should update pickedQuantity and status correctly', async () => {
      const transaction = createTransaction();
      const transactionItem = createTransactionItem();
      const stockAllocation = new StockAllocated();
      const updateStockAllocatedDto = { pickedQuantity: 10 };

      transactionItem.transaction = transaction;
      stockAllocation.transactionItem = transactionItem;
      stockAllocation.pickedQuantity = 0;

      jest
        .spyOn(stockAllocatedRepository, 'save')
        .mockResolvedValue(stockAllocation);

      await service.patch(stockAllocation, updateStockAllocatedDto);

      expect(stockAllocation.pickedQuantity).toBe(10);
      expect(stockAllocation.transactionItem.status).toBe(SlipStatus.PICKING);
    });
  });
});
