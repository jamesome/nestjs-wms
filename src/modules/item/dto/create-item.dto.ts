import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  MaxLength,
  // ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { CreateItemCodeDto } from 'src/modules/item-code/dto/create-item-code.dto';

export class CreateItemDto {
  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'item.name',
    }),
  })
  @MaxLength(200, {
    message: i18nValidationMessage('validation.rules.MAX_LENGTH', {
      message: 'item.name',
    }),
  })
  @ApiProperty({
    required: true,
    description: '창고명',
    example: '보충창고',
    maxLength: 200,
    uniqueItems: true,
  })
  name!: string;

  @MaxLength(200, {
    message: i18nValidationMessage('validation.rules.MAX_LENGTH', {
      message: 'item.property',
    }),
  })
  @ApiProperty({
    required: false,
    description: '품목속성 (셀메이트 옵션명)',
    example: 'a-01',
    maxLength: 200,
  })
  property?: string;

  @Expose({ name: 'item_codes' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'item.item_codes',
    }),
  })
  @IsArray({
    message: i18nValidationMessage('validation.rules.IS-ARRAY', {
      message: 'item.item_codes',
    }),
  })
  // @ValidateNested({ each: true })
  @Type(() => CreateItemCodeDto)
  itemCodes!: CreateItemCodeDto[];
}
