import { Test, TestingModule } from '@nestjs/testing';
import { ItemService } from './item.service';
import { ObjectLiteral, Repository } from 'typeorm';
import { Item } from './entities/item.entity';
// import { FindItemDto } from './dto/find-item.dto';
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

// const mockQueryBuilder = {
//   select: jest.fn().mockReturnThis(),
//   addSelect: jest.fn().mockReturnThis(),
//   leftJoin: jest.fn().mockReturnThis(),
//   where: jest.fn().mockReturnThis(),
//   andWhere: jest.fn().mockReturnThis(),
//   groupBy: jest.fn().mockReturnThis(),
//   orderBy: jest.fn().mockReturnThis(),
//   getManyItem: jest.fn().mockReturnThis(),
// };

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

type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('ItemService', () => {
  let service: ItemService;
  let itemRepository: MockRepository<Item>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemService,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ItemService>(ItemService);
    itemRepository = mockDataSource.getRepository(Item);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('find()', () => {
    // it('should be getManyItemsWithOutInventoryList', async () => {
    //   const findItemDto: FindItemDto = {
    //     name: 'testName',
    //     property: 'testProperty',
    //     itemCode: 'testCode',
    //     itemName: 'name',
    //   };
    //   const mockItems = [
    //     {
    //       id: 1,
    //       name: 'testName',
    //       property: 'test',
    //       itemCodes: [
    //         { id: 1, code: 'aaa' },
    //         { id: 2, code: 'bbb' },
    //       ],
    //       itemSerials: [
    //         { id: 1, serialNo: 'apple-0001' },
    //         { id: 2, serialNo: 'apple-0002' },
    //       ],
    //     },
    //   ];
    //   const mockQuery: PaginateQuery = {
    //     page: 1,
    //     limit: 5,
    //   } as unknown as Request;
    //   itemRepository.find?.mockResolvedValue(mockItems);
    //   const items = await service.find(mockQuery, 1, findItemDto);
    //   const expectedFindOptions = {
    //     where: {
    //       name: Like(`%${findItemDto.name}%`),
    //       property: Like(`%${findItemDto.property}%`),
    //       itemCodes: { code: Like(`%${findItemDto.itemCode}%`) },
    //     },
    //     order: {
    //       createdAt: 'DESC',
    //       id: 'DESC',
    //     },
    //   };
    //   expect(itemRepository.find).toHaveBeenCalledTimes(1);
    //   expect(itemRepository.find).toHaveBeenCalledWith(expectedFindOptions);
    //   items?.forEach((item, index) => {
    //     expect(item.name).toBe(mockItems[index].name);
    //     expect(item.property).toBe(mockItems[index].property);
    //   });
    // });
    // it('should be getManyItemsWithInventoryList', async () => {
    //   const findItemDto: FindItemDto = {
    //     include: 'inventory',
    //     name: 'testName',
    //     property: 'testProperty',
    //     itemCode: 'testCode',
    //     itemName: 'name',
    //   };
    //   const mockItems = [
    //     {
    //       id: 1,
    //       name: 'testName',
    //       property: 'testProperty',
    //       itemCodes: [
    //         { id: 1, code: 'aaa' },
    //         { id: 2, code: 'bbb' },
    //       ],
    //       itemSerials: [
    //         { id: 1, serialNo: 'apple-0001' },
    //         { id: 2, serialNo: 'apple-0002' },
    //       ],
    //       lots: [
    //         {
    //           id: 1,
    //           number: 'supplier1',
    //           expirationDate: '2024-05-09',
    //           supplier: 1,
    //         },
    //         {
    //           id: 2,
    //           number: 'supplier2',
    //           expirationDate: '2024-06-11',
    //           supplier: 2,
    //         },
    //       ],
    //       quantityTotal: 100,
    //       quantityAvailable: 80,
    //       quantityNonAvailable: 20,
    //       quantityByZone: [
    //         { zone_id: 1, zone_name: 'zone1', quantity: 50 },
    //         { zone_id: 2, zone_name: 'zone2', quantity: 50 },
    //       ],
    //       quantityByStatusInZone: [
    //         { zone_id: 1, zone_name: 'zone1', quantity: 50, status: 'normal' },
    //         {
    //           zone_id: 2,
    //           zone_name: 'zone2',
    //           quantity: 50,
    //           status: 'abnormal',
    //         },
    //       ],
    //     },
    //   ];
    //   mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    //   mockQueryBuilder.getManyItem.mockResolvedValue(mockItems);
    //   const items = await service.getManyItemsWithInventoryList(
    //     query,
    //     1,
    //     findItemDto,
    //   );
    //   expect(mockQueryBuilder.select).toHaveBeenCalled();
    //   expect(mockQueryBuilder.addSelect).toHaveBeenCalled();
    //   expect(mockQueryBuilder.leftJoin).toHaveBeenCalled();
    //   expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    //   expect(mockQueryBuilder.groupBy).toHaveBeenCalled();
    //   expect(mockQueryBuilder.orderBy).toHaveBeenCalled();
    //   expect(mockQueryBuilder.getManyItem).toHaveBeenCalled();
    //   items?.forEach((item, index) => {
    //     expect(item.name).toBe(mockItems[index].name);
    //     expect(item.property).toBe(mockItems[index].property);
    //     expect(item.quantity_total).toBe(mockItems[index].quantityTotal);
    //     expect(item.quantity_available).toBe(
    //       mockItems[index].quantityAvailable,
    //     );
    //     expect(item.quantity_by_status_in_zone).toBe(
    //       mockItems[index].quantityByStatusInZone,
    //     );
    //   });
    // });
  });

  describe('findOne', () => {
    const filters = { where: { id: 1 } };
    const mockedItem = {
      id: 1,
      name: 'ice',
      property: 'green',
    };
    it('should be defined', async () => {
      itemRepository.findOne?.mockResolvedValue(mockedItem);

      const result = await service.findOne(1);

      expect(itemRepository.findOne).toHaveBeenCalledTimes(1);
      expect(itemRepository.findOne).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockedItem);
    });
  });
});
