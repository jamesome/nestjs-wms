import { Test, TestingModule } from '@nestjs/testing';
import { StockAllocatedController } from './stock-allocated.controller';
import { CONNECTION } from 'src/common/constants';
import { StockAllocatedService } from './stock-allocated.service';

describe('StockAllocatedController', () => {
  let controller: StockAllocatedController;

  beforeEach(async () => {
    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue({
        create: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockAllocatedController],
      providers: [
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
        StockAllocatedService,
      ],
    }).compile();

    controller = module.get<StockAllocatedController>(StockAllocatedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
