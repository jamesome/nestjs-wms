import { IsNotEmpty, MaxLength } from 'class-validator';
import { I18nValidate } from 'src/common/decorators/validations/i18n-validate.decorator';

export class CreateSupplierDto {
  @I18nValidate(IsNotEmpty)
  @I18nValidate(MaxLength, 100)
  name!: string;
}
