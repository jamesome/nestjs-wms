import { IsEnum, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { I18nValidate } from 'src/common/decorators/i18n-validate.decorator';
import { TransformEmptyToNull } from 'src/common/decorators/transform-empty-to-null';
import { StockStatus } from 'src/modules/enum';

export class MoveInventoryItemDto {
  @I18nValidate(IsNotEmpty)
  itemId!: number;

  @I18nValidate(IsNotEmpty)
  locationDepartureId!: number;

  @I18nValidate(IsNotEmpty)
  locationArrivalId!: number;

  @IsOptional()
  @TransformEmptyToNull()
  lotId?: number | null;

  @I18nValidate(IsNotEmpty)
  operationTypeId!: number;

  // @I18nValidate(IsNotEmpty)
  @I18nValidate(IsEnum)
  status!: StockStatus;

  @I18nValidate(IsNotEmpty)
  @I18nValidate(Min, 1)
  quantity!: number;

  @IsOptional()
  remark?: string;
}
