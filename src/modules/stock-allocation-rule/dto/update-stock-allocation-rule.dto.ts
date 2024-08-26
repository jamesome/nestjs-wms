import { IntersectionType } from '@nestjs/swagger';
import { CreateStockAllocationRuleDto } from './create-stock-allocation-rule.dto';
import { Optional } from '@nestjs/common';

export class UpdateStockAllocationRuleDto extends IntersectionType(
  CreateStockAllocationRuleDto,
) {
  @Optional()
  priority!: number;
}
