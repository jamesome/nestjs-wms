import { Test, TestingModule } from '@nestjs/testing';
import { LotController } from './lot.controller';
import { LotService } from './lot.service';
import { CONNECTION } from 'src/common/constants';

describe('LotController', () => {
  let controller: LotController;

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
      controllers: [LotController],
      providers: [
        LotService,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    controller = module.get<LotController>(LotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
