import { Test, TestingModule } from '@nestjs/testing';
import { ItemSerialService } from './item-serial.service';

describe('ItemSerialService', () => {
  let service: ItemSerialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItemSerialService],
    }).compile();

    service = module.get<ItemSerialService>(ItemSerialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
