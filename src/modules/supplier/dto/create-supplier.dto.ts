import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateSupplierDto {
  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'supplier.name',
    }),
  })
  @MaxLength(100, {
    message: i18nValidationMessage('validation.rules.MAX_LENGTH', {
      message: 'supplier.name',
    }),
  })
  @ApiProperty({
    required: true,
    description: '공급처명',
    example: '동대문상회',
    maxLength: 100,
    uniqueItems: true,
  })
  name!: string;
}
