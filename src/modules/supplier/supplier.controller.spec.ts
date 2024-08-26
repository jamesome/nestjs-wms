import { Test, TestingModule } from '@nestjs/testing';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';
import { CONNECTION } from 'src/common/constants';

describe('SupplierController', () => {
  let controller: SupplierController;

  beforeEach(async () => {
    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue({
        create: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupplierController],
      providers: [
        SupplierService,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    controller = module.get<SupplierController>(SupplierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
