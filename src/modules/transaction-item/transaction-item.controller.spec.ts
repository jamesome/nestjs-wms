import { Test, TestingModule } from '@nestjs/testing';
import { TransactionItemController } from './transaction-item.controller';
import { TransactionItemService } from './transaction-item.service';
import { CONNECTION } from 'src/common/constants';

describe('TransactionItemController', () => {
  let controller: TransactionItemController;

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
      controllers: [TransactionItemController],
      providers: [
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
        TransactionItemService,
      ],
    }).compile();

    controller = module.get<TransactionItemController>(
      TransactionItemController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
