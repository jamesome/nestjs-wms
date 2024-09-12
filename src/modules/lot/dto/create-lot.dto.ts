import { IsDate, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { I18nValidate } from 'src/common/decorators/validations/i18n-validate.decorator';

export class CreateLotDto {
  @I18nValidate(IsNotEmpty)
  @I18nValidate(IsInt)
  itemId!: number;

  @I18nValidate(IsNotEmpty)
  @I18nValidate(IsInt)
  supplierId!: number;

  @I18nValidate(IsNotEmpty)
  number!: string;

  @IsOptional()
  @I18nValidate(IsDate)
  expirationDate?: Date | null = null;
}
