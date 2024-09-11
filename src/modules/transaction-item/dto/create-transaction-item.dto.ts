import { IsEnum, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { I18nValidate } from 'src/common/decorators/i18n-validate.decorator';
import { StockStatus } from 'src/modules/enum';

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
  quantity!: number;

  @I18nValidate(IsInt)
  price?: number | null;

  @I18nValidate(IsEnum, StockStatus)
  status?: StockStatus;

  @IsOptional()
  remark?: string;
}
