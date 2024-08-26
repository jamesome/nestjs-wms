import { Test, TestingModule } from '@nestjs/testing';
import { OperationTypeService } from './operation-type.service';
import { ObjectLiteral, Repository } from 'typeorm';
import { OperationType } from './entities/operation-type.entity';
import { FindOperationTypeDto } from './dto/find-operation-type.dto';
import { Category } from '../enum';
import { CONNECTION } from 'src/common/constants';

const mockWarehouseRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

const mockDataSource = {
  getRepository: jest.fn().mockReturnValue(mockWarehouseRepository),
};

type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('OperationTypeService', () => {
  let service: OperationTypeService;
  let operationTypeRepository: MockRepository<OperationType>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OperationTypeService,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<OperationTypeService>(OperationTypeService);
    operationTypeRepository = mockDataSource.getRepository(OperationType);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it.todo('create()');
  });
  describe('findAll()', () => {
    it('should be findAll', async () => {
      const findOperationTypeDto: FindOperationTypeDto = {
        category: Category.RECEIVING,
      };

      const mockItems = [
        {
          id: 1,
          category: 'movement',
          code: 105,
          name: '검사 후 입고',
          is_default: 0,
        },
      ];

      operationTypeRepository.find?.mockResolvedValue(mockItems);

      const operationTypes = await service.findAll(findOperationTypeDto);

      expect(operationTypeRepository.find).toHaveBeenCalledTimes(1);
      operationTypes?.forEach((operationType, index) => {
        expect(operationType.category).toBe(mockItems[index].category);
        expect(operationType.name).toBe(mockItems[index].name);
      });
    });
  });
  describe('findOne()', () => {
    it.todo('findOne()');
  });
  describe('update()', () => {
    it.todo('update()');
  });
  describe('remove()', () => {
    it.todo('remove()');
  });
});
