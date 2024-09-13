import { Module } from '@nestjs/common';
import { StockAllocatedController } from './stock-allocated.controller';
import { StockAllocatedService } from './stock-allocated.service';

@Module({
  controllers: [StockAllocatedController],
  providers: [StockAllocatedService],
})
export class StockAllocatedModule {}
