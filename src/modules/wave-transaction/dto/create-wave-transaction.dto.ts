import { IsNotEmpty } from 'class-validator';
import { I18nValidate } from 'src/common/decorators/i18n-validate.decorator';

export class CreateWaveTransactionDto {
  @I18nValidate(IsNotEmpty)
  waveId!: number;

  @I18nValidate(IsNotEmpty)
  transactionId!: number;
}
