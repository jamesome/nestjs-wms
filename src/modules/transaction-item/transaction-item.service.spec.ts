import { Test, TestingModule } from '@nestjs/testing';
import { CONNECTION } from 'src/common/constants';
import { TransactionItem } from './entities/transaction-item.entity';

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

describe('TransactionItem', () => {
  let service: TransactionItem;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionItem,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<TransactionItem>(TransactionItem);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
