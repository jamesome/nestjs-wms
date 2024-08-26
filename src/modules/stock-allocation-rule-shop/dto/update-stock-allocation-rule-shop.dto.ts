import { PartialType } from '@nestjs/swagger';
import { CreateStockAllocationRuleShopDto } from './create-stock-allocation-rule-shop.dto';

export class UpdateStockAllocationRuleShopDto extends PartialType(
  CreateStockAllocationRuleShopDto,
) {}
