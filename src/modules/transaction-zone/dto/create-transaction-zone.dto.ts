import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateTransactionZoneDto {
  @Expose({ name: 'transaction_id' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'transaction_zone.transaction_id',
    }),
  })
  transactionId!: number;

  @Expose({ name: 'zone_id' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'transaction_zone.zone_id',
    }),
  })
  zoneId!: number;
}
