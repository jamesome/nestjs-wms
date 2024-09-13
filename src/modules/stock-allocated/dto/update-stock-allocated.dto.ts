import { IsInt, IsOptional, Min } from 'class-validator';
import { I18nValidate } from 'src/common/decorators/validations/i18n-validate.decorator';
import { SlipStatus } from 'src/modules/enum';

export class UpdateStockAllocatedDto {
  @IsOptional()
  id?: number;

  @IsOptional()
  status?: SlipStatus;

  @IsOptional()
  @I18nValidate(IsInt)
  @I18nValidate(Min, 1)
  pickedQuantity?: number;
}
