import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { I18nValidate } from 'src/common/decorators/validations/i18n-validate.decorator';
import { TransformEmptyToNull } from 'src/common/decorators/transform-empty-to-null';

export class CreateZoneDto {
  @I18nValidate(IsNotEmpty)
  warehouseId!: number;

  @I18nValidate(IsNotEmpty)
  @I18nValidate(MaxLength, 10)
  name!: string;

  @IsOptional()
  @TransformEmptyToNull()
  @I18nValidate(MaxLength, 100)
  code?: string | null;
}
