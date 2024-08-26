import { Module } from '@nestjs/common';
import { LotService } from './lot.service';
import { LotController } from './lot.controller';

@Module({
  controllers: [LotController],
  providers: [LotService],
})
export class LotModule {}
