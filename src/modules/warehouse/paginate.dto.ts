import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { I18nValidate } from 'src/common/decorators/validations/i18n-validate.decorator';

export class PaginateDto {
  @IsOptional()
  @I18nValidate(IsInt)
  @I18nValidate(Min, 1)
  page?: number;

  @IsOptional()
  @I18nValidate(IsInt)
  @I18nValidate(Max, 100)
  limit?: number;
}
