import { PartialType } from '@nestjs/swagger';
import { CreateStockAllocationRuleZoneDto } from './create-stock-allocation-rule-zone.dto';

export class UpdateStockAllocationRuleZoneDto extends PartialType(
  CreateStockAllocationRuleZoneDto,
) {}
