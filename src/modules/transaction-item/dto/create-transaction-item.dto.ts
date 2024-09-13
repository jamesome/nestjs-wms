import { IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';
import { I18nValidate } from 'src/common/decorators/validations/i18n-validate.decorator';
import { SlipStatus } from 'src/modules/enum';

export class CreateTransactionItemDto {
  @I18nValidate(IsNotEmpty)
  transactionId!: number;

  @I18nValidate(IsNotEmpty)
  itemId?: number;

  @IsOptional()
  locationDepartureId?: number | null;

  @IsOptional()
  locationArrivalId?: number | null;

  @IsOptional()
  lotId?: number | null;

  @IsOptional()
  supplierId?: number | null;

  @IsOptional()
  operationTypeId?: number | null;

  @I18nValidate(IsNotEmpty)
  @I18nValidate(IsInt)
  @I18nValidate(Min, 1)
  orderedQuantity!: number;

  @I18nValidate(IsInt)
  price!: number | null;

  // FIXME: SlipStatus[] 처리 필요
  @I18nValidate(IsNotEmpty)
  // @I18nValidate(IsEnum, SlipStatus)
  status!: SlipStatus | SlipStatus[];

  @IsOptional()
  remark?: string;

  @IsOptional()
  @I18nValidate(Max, 500)
  imageUrl?: string;
}
