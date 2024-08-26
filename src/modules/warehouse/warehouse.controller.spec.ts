import { Test, TestingModule } from '@nestjs/testing';
import { WarehouseController } from './warehouse.controller';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { EntityValidationService } from 'src/common/helpers/entity-validation.service';
import { CONNECTION } from 'src/common/constants';

describe('WarehouseController', () => {
  let controller: WarehouseController;

  beforeEach(async () => {
    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue({
        create: jest
          .fn()
          .mockReturnValue({ id: 1, ...new CreateWarehouseDto() }),
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WarehouseController],
      providers: [
        WarehouseService,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
        EntityValidationService,
      ],
    }).compile();

    controller = module.get<WarehouseController>(WarehouseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
