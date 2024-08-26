import { Expose } from 'class-transformer';
import { Min, Validate, ValidateIf } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { OneIsRequired } from 'src/common/decorators/one-is-required';
import { TransformStringToNumber } from 'src/common/decorators/transform-string-to-number';

export class MakeWaveDto {
  @Validate(OneIsRequired, ['ordersPerWave', 'ordersToProcess'], {
    message: i18nValidationMessage('validation.rules.ONE_IS_REQUIRED', {
      message: 'wave.at_least_one_required',
    }),
  })
  oneIsRequired!: boolean;

  @Expose({ name: 'orders_per_wave' })
  @TransformStringToNumber()
  @ValidateIf((obj) => obj.ordersPerWave)
  @Min(1, {
    message: i18nValidationMessage('validation.rules.MIN', {
      message: 'wave.orders_per_wave',
    }),
  })
  ordersPerWave!: number; // 작업단위 수량(number of orders per wave)

  @Expose({ name: 'orders_to_process' })
  @TransformStringToNumber()
  @ValidateIf((obj) => obj.ordersToProcess)
  @Min(1, {
    message: i18nValidationMessage('validation.rules.MIN', {
      message: 'wave.orders_to_process',
    }),
  })
  ordersToProcess!: number; // 작업대상 수량(total orders to process)
}
