import { Module } from '@nestjs/common';
import { ItemSerialService } from './item-serial.service';
import { ItemSerialController } from './item-serial.controller';

@Module({
  controllers: [ItemSerialController],
  providers: [ItemSerialService],
})
export class ItemSerialModule {}
