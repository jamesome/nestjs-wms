import { Test, TestingModule } from '@nestjs/testing';
import { EntityValidationService } from 'src/common/helpers/entity-validation.service';
import { InventoryItemService } from './inventory-item.service';
import { CONNECTION } from 'src/common/constants';

describe('InventoryItemService', () => {
  let service: InventoryItemService;

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
      providers: [
        InventoryItemService,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
        EntityValidationService,
      ],
    }).compile();

    service = module.get<InventoryItemService>(InventoryItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
