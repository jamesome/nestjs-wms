import { Module } from '@nestjs/common';
import { StockAllocationRuleService } from './stock-allocation-rule.service';
import { StockAllocationRuleController } from './stock-allocation-rule.controller';

@Module({
  controllers: [StockAllocationRuleController],
  providers: [StockAllocationRuleService],
})
export class StockAllocationRuleModule {}
