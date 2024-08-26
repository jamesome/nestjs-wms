import { Test, TestingModule } from '@nestjs/testing';
import { StockAllocationRuleController } from './stock-allocation-rule.controller';
import { StockAllocationRuleService } from './stock-allocation-rule.service';
import { CONNECTION } from 'src/common/constants';

describe('StockAllocationRuleController', () => {
  let controller: StockAllocationRuleController;

  beforeEach(async () => {
    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue({
        find: jest.fn(),
        findOne: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockAllocationRuleController],
      providers: [
        StockAllocationRuleService,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    controller = module.get<StockAllocationRuleController>(
      StockAllocationRuleController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
