import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { I18nValidate } from 'src/common/decorators/validations/i18n-validate.decorator';
import { TransformEmptyToNull } from 'src/common/decorators/transform-empty-to-null';
import { TransformNumberToString } from 'src/common/decorators/transform-number-to-string';

export class CreateWarehouseDto {
  @I18nValidate(IsNotEmpty)
  @I18nValidate(MaxLength, 100)
  name!: string;

  @TransformEmptyToNull()
  @IsOptional()
  @I18nValidate(MaxLength, 100)
  code?: string | null;

  @TransformNumberToString()
  @IsOptional()
  @I18nValidate(MaxLength, 6)
  postCode?: string;

  @TransformNumberToString()
  @IsOptional()
  @I18nValidate(MaxLength, 500)
  address?: string;

  @TransformNumberToString()
  @IsOptional()
  @I18nValidate(MaxLength, 500)
  detailAddress?: string;

  @IsOptional()
  @I18nValidate(MaxLength, 50)
  manager?: string;

  @TransformNumberToString()
  @IsOptional()
  @I18nValidate(MaxLength, 20)
  contact?: string;

  @IsOptional()
  isDefault?: boolean;
}
