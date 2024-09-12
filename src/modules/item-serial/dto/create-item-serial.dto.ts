import { MaxLength } from 'class-validator';
import { I18nValidate } from 'src/common/decorators/validations/i18n-validate.decorator';

export class CreateItemSerialDto {
  @I18nValidate(MaxLength, 50)
  serialNo!: string;
}
