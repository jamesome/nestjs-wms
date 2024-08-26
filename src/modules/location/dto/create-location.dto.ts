import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Expose } from 'class-transformer';

export class CreateLocationDto {
  @Expose({ name: 'zone_id' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY'),
  })
  zoneId!: number;

  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'location.name',
    }),
  })
  @MaxLength(100, {
    message: i18nValidationMessage('validation.rules.MAX_LENGTH', {
      message: 'location.name',
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
  @ApiProperty({
    required: false,
    description: '비고',
    example: 'CS팀 전용 로케이션입니다!!',
  })
  remark?: string;

  @Expose({ name: 'is_default' })
  @IsOptional()
  @ApiProperty({
    required: false,
    description: '기본 로케이션',
    example: 1,
  })
  isDefault?: number;
}
