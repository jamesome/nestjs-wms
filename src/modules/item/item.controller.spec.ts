import { Test, TestingModule } from '@nestjs/testing';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { CONNECTION } from 'src/common/constants';
describe('ItemController', () => {
  let controller: ItemController;

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
      controllers: [ItemController],
      providers: [
        ItemService,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    controller = module.get<ItemController>(ItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
