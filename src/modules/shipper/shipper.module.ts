import { Module } from '@nestjs/common';
import { ShipperService } from './shipper.service';
import { ShipperController } from './shipper.controller';

@Module({
  controllers: [ShipperController],
  providers: [ShipperService],
})
export class ShipperModule {}
