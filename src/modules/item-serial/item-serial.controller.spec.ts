import { Test, TestingModule } from '@nestjs/testing';
import { ItemSerialController } from './item-serial.controller';
import { ItemSerialService } from './item-serial.service';

describe('ItemSerialController', () => {
  let controller: ItemSerialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemSerialController],
      providers: [ItemSerialService],
    }).compile();

    controller = module.get<ItemSerialController>(ItemSerialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
