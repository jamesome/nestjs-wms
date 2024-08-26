import { Test, TestingModule } from '@nestjs/testing';
import { LocationService } from './location.service';
import { EntityValidationService } from 'src/common/helpers/entity-validation.service';
import { CONNECTION } from 'src/common/constants';
import { ObjectLiteral, Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';

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

describe('LocationService', () => {
  let service: LocationService;
  let repository: MockRepository<Location>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
        EntityValidationService,
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
    repository = mockDataSource.getRepository(Location);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    const createLocationDto: CreateLocationDto = {
      zoneId: 1,
      name: '반품-1',
      remark: '반품로케이션',
    };

    it('should fail on exception', async () => {
      repository.create?.mockReturnValue(createLocationDto);
      repository.save?.mockResolvedValue('save error');

      const result = await service.create(createLocationDto);

      expect(result).toEqual('save error');
    });

    it('should create Posts', async () => {
      repository.create?.mockReturnValue(createLocationDto);
      repository.save?.mockResolvedValue(createLocationDto);

      const result = await service.create(createLocationDto);

      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
      expect(result).toEqual(createLocationDto);
    });
  });

  describe('remove()', () => {
    it('should be remove post', async () => {
      const zone = {
        id: 123,
        name: 'zone 1',
      } as Location;

      repository.findOne?.mockResolvedValue(zone);
      repository.delete?.mockResolvedValue(undefined);

      await service.remove(zone.id);

      expect(repository.delete).toHaveBeenCalledWith(123);
    });
  });
});
