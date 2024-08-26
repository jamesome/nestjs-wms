import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateWaveTransactionDto {
  @Expose({ name: 'wave_id' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'wave_transaction.wave_id',
    }),
  })
  waveId!: number;

  @Expose({ name: 'transaction_id' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'wave_transaction.transaction_id',
    }),
  })
  transactionId!: number;
}
