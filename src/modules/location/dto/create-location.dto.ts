import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { I18nValidate } from 'src/common/decorators/i18n-validate.decorator';

export class CreateLocationDto {
  @I18nValidate(IsNotEmpty)
  zoneId!: number;

  @I18nValidate(IsNotEmpty)
  @I18nValidate(MaxLength, 100)
  name!: string;

  @IsOptional()
  remark?: string;

  @IsOptional()
  isDefault?: number;
}
