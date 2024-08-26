import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { TransformNumberToString } from 'src/common/decorators/transform-number-to-string';

export class CreateItemCodeDto {
  @TransformNumberToString()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'item_code.code',
    }),
  })
  @MaxLength(100, {
    message: i18nValidationMessage('validation.rules.MAX_LENGTH', {
      message: 'item_code.code',
    }),
  })
  @ApiProperty({
    required: true,
    description: '바코드1 ~ 3, 글로벌 바코드',
    example: 's123123',
    maxLength: 50,
    uniqueItems: true,
  })
  code!: string;
}
