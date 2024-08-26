import { IsInt, IsOptional, Max } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class PaginateDto {
  @IsOptional()
  @IsInt({
    message: i18nValidationMessage('validation.IS_INT'),
  })

  // @Min(1)
  page?: number;

  @IsOptional()
  @IsInt({
    message: i18nValidationMessage('validation.IS_INT'),
  })
  @Max(100, {
    message: i18nValidationMessage('validation.MAX'),
  })
  limit?: number;
}
