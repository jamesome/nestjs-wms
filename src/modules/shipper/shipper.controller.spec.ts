import { Test, TestingModule } from '@nestjs/testing';
import { ShipperController } from './shipper.controller';
import { ShipperService } from './shipper.service';
import { CONNECTION } from 'src/common/constants';

describe('ShipperController', () => {
  let controller: ShipperController;

  beforeEach(async () => {
    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue({
        find: jest.fn(),
        findOne: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShipperController],
      providers: [
        ShipperService,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    controller = module.get<ShipperController>(ShipperController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
