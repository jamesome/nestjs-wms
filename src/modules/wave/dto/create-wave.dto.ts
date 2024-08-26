import { IsInt, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateWaveDto {
  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'wave.sequence',
    }),
  })
  @IsInt({
    message: i18nValidationMessage('validation.rules.IS_INT', {
      message: 'wave.sequence',
    }),
  })
  sequence!: number;

  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'wave.shipper_id',
    }),
  })
  @IsInt({
    message: i18nValidationMessage('validation.rules.IS_INT', {
      message: 'wave.shipper_id',
    }),
  })
  shipperId!: number;

  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'wave.name',
    }),
  })
  name!: string;

  createWorker!: string;
}
