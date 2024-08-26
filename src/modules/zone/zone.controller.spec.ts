import { Test, TestingModule } from '@nestjs/testing';
import { ZoneController } from './zone.controller';
import { ZoneService } from './zone.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { EntityValidationService } from 'src/common/helpers/entity-validation.service';
import { CONNECTION } from 'src/common/constants';

describe('ZoneController', () => {
  let controller: ZoneController;

  beforeEach(async () => {
    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue({
        create: jest.fn().mockReturnValue({ id: 1, ...new CreateZoneDto() }),
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZoneController],
      providers: [
        ZoneService,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
        EntityValidationService,
      ],
    }).compile();

    controller = module.get<ZoneController>(ZoneController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
