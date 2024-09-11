import { IsNotEmpty, MaxLength } from 'class-validator';
import { I18nValidate } from 'src/common/decorators/i18n-validate.decorator';
import { TransformNumberToString } from 'src/common/decorators/transform-number-to-string';

export class CreateItemCodeDto {
  @TransformNumberToString()
  @I18nValidate(IsNotEmpty)
  @I18nValidate(MaxLength, 100)
  code!: string;
}
