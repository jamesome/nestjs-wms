import { Test, TestingModule } from '@nestjs/testing';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { EntityValidationService } from 'src/common/helpers/entity-validation.service';
import { CONNECTION } from 'src/common/constants';

describe('LocationController', () => {
  let controller: LocationController;

  beforeEach(async () => {
    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue({
        create: jest
          .fn()
          .mockReturnValue({ id: 1, ...new CreateLocationDto() }),
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [
        LocationService,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
        EntityValidationService,
      ],
    }).compile();

    controller = module.get<LocationController>(LocationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
