import { Test, TestingModule } from '@nestjs/testing';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { CONNECTION } from 'src/common/constants';

describe('ShopController', () => {
  let controller: ShopController;

  beforeEach(async () => {
    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue({
        find: jest.fn(),
        findOne: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopController],
      providers: [
        ShopService,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    controller = module.get<ShopController>(ShopController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
