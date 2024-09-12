import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, MaxLength } from 'class-validator';
import { I18nValidate } from 'src/common/decorators/validations/i18n-validate.decorator';
import { CreateItemCodeDto } from 'src/modules/item-code/dto/create-item-code.dto';

export class CreateItemDto {
  @I18nValidate(IsNotEmpty)
  @I18nValidate(MaxLength, 200)
  name!: string;

  @I18nValidate(MaxLength, 200)
  property?: string;

  @I18nValidate(IsNotEmpty)
  @I18nValidate(IsArray)
  @Type(() => CreateItemCodeDto)
  itemCodes!: CreateItemCodeDto[];
}
