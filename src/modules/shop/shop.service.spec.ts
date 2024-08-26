import { Test, TestingModule } from '@nestjs/testing';
import { ShopService } from './shop.service';
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

describe('ShopService', () => {
  let service: ShopService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopService,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ShopService>(ShopService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
