import { Test, TestingModule } from '@nestjs/testing';
import { ItemCodeController } from './item-code.controller';
import { ItemCodeService } from './item-code.service';
import { CONNECTION } from 'src/common/constants';

describe('ItemCodeController', () => {
  let controller: ItemCodeController;

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
      controllers: [ItemCodeController],
      providers: [
        ItemCodeService,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    controller = module.get<ItemCodeController>(ItemCodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
