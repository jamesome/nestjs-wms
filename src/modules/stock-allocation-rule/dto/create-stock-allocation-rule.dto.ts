import { Optional } from '@nestjs/common';
import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateStockAllocationRuleDto {
  @Expose()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'stock_allocation_rule.name',
    }),
  })
  name!: string;

  @Expose({ name: 'warehouse_id' })
  warehouseId!: number;

  @Expose({ name: 'shipper_id' })
  @Optional()
  shipperId!: number | null;

  @Expose()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'stock_allocation_rule.method',
    }),
  })
  method!: string;

  @Expose({ name: 'zone_filter' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'stock_allocation_rule.zone_filter',
    }),
  })
  zoneFilter!: string;

  @Expose({ name: 'is_default' })
  isDefault?: number;

  @Expose({ name: 'shop_ids' })
  @Optional()
  shopIds!: number[];

  @Expose({ name: 'zone_ids' })
  @Optional()
  zoneIds!: number[];
}
