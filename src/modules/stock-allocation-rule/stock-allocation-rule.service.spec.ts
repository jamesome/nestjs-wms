import { Test, TestingModule } from '@nestjs/testing';
import { StockAllocationRuleService } from './stock-allocation-rule.service';
import { CONNECTION } from 'src/common/constants';

const mockRepository = {
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockDataSource = {
  getRepository: jest.fn().mockReturnValue(mockRepository),
};

describe('StockAllocationRuleService', () => {
  let service: StockAllocationRuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockAllocationRuleService,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<StockAllocationRuleService>(
      StockAllocationRuleService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
