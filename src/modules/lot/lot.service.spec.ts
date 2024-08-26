import { Test, TestingModule } from '@nestjs/testing';
import { LotService } from './lot.service';
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

const mockDataSource = {
  getRepository: jest.fn().mockReturnValue(mockRepository),
  // createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
};

// type MockRepository<T extends ObjectLiteral = any> = Partial<
//   Record<keyof Repository<T>, jest.Mock>
// >;

describe('LotService', () => {
  let service: LotService;
  // let lotRepository: MockRepository<Lot>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LotService,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<LotService>(LotService);
    // lotRepository = mockDataSource.getRepository(Lot);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
