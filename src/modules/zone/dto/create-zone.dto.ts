import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { TransformEmptyToNull } from 'src/common/decorators/transform-empty-to-null';

export class CreateZoneDto {
  @Expose({ name: 'warehouse_id' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'zone.name',
    }),
  })
  warehouseId!: number;

  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'zone.name',
    }),
  })
  @MaxLength(10, {
    message: i18nValidationMessage('validation.rules.MAX_LENGTH', {
      message: 'zone.name',
    }),
  })
  @ApiProperty({
    required: true,
    description: '분류명',
    example: '보충창고',
    maxLength: 100,
    uniqueItems: true,
  })
  name!: string;

  @IsOptional()
  @TransformEmptyToNull()
  @MaxLength(100, {
    message: i18nValidationMessage('validation.rules.MAX_LENGTH', {
      message: 'zone.code',
    }),
  })
  @ApiProperty({
    required: false,
    description: '분류코드',
    example: 'a-01',
    maxLength: 100,
    uniqueItems: true,
  })
  code?: string | null;

  // @Expose({ name: 'is_default' })
  // @IsOptional()
  // @ApiProperty({
  //   required: false,
  //   description: '기본 분류',
  //   example: 1,
  // })
  // isDefault?: number;
}
