import { Min } from 'class-validator';
import { I18nValidate } from 'src/common/decorators/i18n-validate.decorator';
import { TransformStringToNumber } from 'src/common/decorators/transform-string-to-number';

export class CreateWaveDto {
  @TransformStringToNumber()
  @I18nValidate(Min, 1)
  ordersPerWave!: number; // 작업단위 수량(number of orders per wave)
}
