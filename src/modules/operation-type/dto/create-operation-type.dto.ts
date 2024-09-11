import { IsEnum, IsNotEmpty, MaxLength } from 'class-validator';
import { I18nValidate } from 'src/common/decorators/i18n-validate.decorator';
import { Category } from 'src/modules/enum';

export class CreateOperationTypeDto {
  @I18nValidate(IsNotEmpty)
  @I18nValidate(IsEnum, Category)
  category!: Category;

  @I18nValidate(IsNotEmpty)
  @I18nValidate(MaxLength, 50)
  name!: string;
}
