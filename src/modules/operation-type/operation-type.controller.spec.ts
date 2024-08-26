import { Test, TestingModule } from '@nestjs/testing';
import { OperationTypeController } from './operation-type.controller';
import { OperationTypeService } from './operation-type.service';
import { CONNECTION } from 'src/common/constants';

describe('OperationTypeController', () => {
  let controller: OperationTypeController;

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
      controllers: [OperationTypeController],
      providers: [
        OperationTypeService,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    controller = module.get<OperationTypeController>(OperationTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
