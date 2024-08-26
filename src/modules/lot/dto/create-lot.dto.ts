import { Expose } from 'class-transformer';
import { IsDate, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateLotDto {
  @Expose({ name: 'item_id' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'lot.item_id',
    }),
  })
  @IsInt({
    message: i18nValidationMessage('validation.IS_INT', {
      message: 'lot.item_id',
    }),
  })
  itemId!: number;

  @Expose({ name: 'supplier_id' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'lot.supplier_id',
    }),
  })
  @IsInt({
    message: i18nValidationMessage('validation.IS_INT', {
      message: 'lot.supplier_id',
    }),
  })
  supplierId!: number;

  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'lot.number',
    }),
  })
  number!: string;

  @Expose({ name: 'expiration_date' })
  @IsOptional()
  @IsDate({
    message: i18nValidationMessage('validation.rules.IS_DATE', {
      message: 'lot.expiration_date',
    }),
  })
  expirationDate?: Date | null = null;
}
