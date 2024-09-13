import { Optional } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { I18nValidate } from 'src/common/decorators/validations/i18n-validate.decorator';

export class CreateStockAllocationRuleDto {
  @I18nValidate(IsNotEmpty)
  name!: string;

  warehouseId!: number;

  @Optional()
  shipperId!: number | null;

  @I18nValidate(IsNotEmpty)
  method!: string;

  @I18nValidate(IsNotEmpty)
  zoneFilter!: string;

  isDefault?: boolean;

  @Optional()
  shopIds!: number[];

  @Optional()
  zoneIds!: number[];
}
