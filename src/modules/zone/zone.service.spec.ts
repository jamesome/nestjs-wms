import { Test, TestingModule } from '@nestjs/testing';
import { EntityValidationService } from 'src/common/helpers/entity-validation.service';
import { CONNECTION } from 'src/common/constants';
import { ObjectLiteral, Repository } from 'typeorm';
import { Zone } from './entities/zone.entity';
import { ZoneService } from './zone.service';
import { CreateZoneDto } from './dto/create-zone.dto';

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

const mockDataSource = {
  getRepository: jest.fn().mockReturnValue(mockRepository),
};

type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('ZoneService', () => {
  let service: ZoneService;
  let repository: MockRepository<Zone>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZoneService,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
        EntityValidationService,
      ],
    }).compile();

    service = module.get<ZoneService>(ZoneService);
    repository = mockDataSource.getRepository(Zone);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    const createZoneDto: CreateZoneDto = {
      warehouseId: 1,
      name: '창고-1',
      code: '',
    };

    it('should fail on exception', async () => {
      repository.create?.mockReturnValue(createZoneDto);
      repository.save?.mockResolvedValue('save error');

      const result = await service.create(createZoneDto);

      expect(result).toEqual('save error');
    });

    it('should create Posts', async () => {
      repository.create?.mockReturnValue(createZoneDto);
      repository.save?.mockResolvedValue(createZoneDto);

      const result = await service.create(createZoneDto);

      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
      expect(result).toEqual(createZoneDto);
    });
  });

  describe('remove()', () => {
    it('should be remove post', async () => {
      const zone = {
        id: 123,
        name: 'zone 1',
      } as Zone;

      repository.findOne?.mockResolvedValue(zone);
      repository.delete?.mockResolvedValue(undefined);

      await service.remove(zone.id);

      expect(repository.delete).toHaveBeenCalledWith(123);
    });
  });
});
