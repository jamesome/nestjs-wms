import { Test, TestingModule } from '@nestjs/testing';
import { ShipperService } from './shipper.service';
import { CONNECTION } from 'src/common/constants';
import { FindShipperDto } from './dto/find-shipper.dto';
import { Shipper } from './entities/shipper.entity';
import { ObjectLiteral, Repository } from 'typeorm';

const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
};

const mockDataSource = {
  getRepository: jest.fn().mockReturnValue(mockRepository),
};

type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('ShipperService', () => {
  let service: ShipperService;
  let shipperRepository: MockRepository<Shipper>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipperService,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ShipperService>(ShipperService);
    shipperRepository = mockDataSource.getRepository(Shipper);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('find()', () => {
    const mockItems = [
      {
        id: 1,
        name: 'testName',
      },
    ];
    it('should be findAll', async () => {
      const findShipperDto: FindShipperDto = {
        name: 'testName',
      };

      const shippers = await service.findAll(findShipperDto);

      expect(shipperRepository.find).toHaveBeenCalledTimes(1);
      shippers?.forEach((shipper, index) => {
        expect(shipper.name).toBe(mockItems[index].name);
      });
    });

    it('should be findOne', async () => {
      const filters = { where: { id: 1 } };
      const mockedItem = {
        id: 1,
        name: 'ice',
      };

      shipperRepository.findOne?.mockResolvedValue(mockedItem);

      const shippers = await service.findOne(filters.where.id);

      expect(shipperRepository.find).toHaveBeenCalledTimes(1);
      expect(shipperRepository.findOne).toHaveBeenCalledWith(filters);
      expect(shippers).toEqual(mockedItem);
    });
  });
});
