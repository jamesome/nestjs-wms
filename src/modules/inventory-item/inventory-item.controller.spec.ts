import { Test, TestingModule } from '@nestjs/testing';
import { InventoryItemService } from './inventory-item.service';
import { InventoryItemController } from './inventory-item.controller';
import { CONNECTION } from 'src/common/constants';

describe('InventoryItemController', () => {
  let controller: InventoryItemController;

  beforeEach(async () => {
    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue({
        find: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryItemController],
      providers: [
        InventoryItemService,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    controller = module.get<InventoryItemController>(InventoryItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
