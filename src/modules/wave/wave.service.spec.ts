import { Test, TestingModule } from '@nestjs/testing';
import { WaveService } from './wave.service';
import { CONNECTION } from 'src/common/constants';

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnThis(),
};

const mockQueryRunner = {
  connect: jest.fn().mockReturnThis(),
  startTransaction: jest.fn().mockReturnThis(),
  commitTransaction: jest.fn().mockReturnThis(),
  rollbackTransaction: jest.fn().mockReturnThis(),
  release: jest.fn().mockReturnThis(),
};

const mockDataSource = {
  getRepository: jest.fn().mockReturnValue(mockRepository),
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
};

describe('WaveService', () => {
  let service: WaveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaveService,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<WaveService>(WaveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
