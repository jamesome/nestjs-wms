import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Category, InputType, SlipStatus } from 'src/modules/enum';

export class CreateTransactionDto {
  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'transaction.transaction_group_id',
    }),
  })
  transactionGroupId!: number;

  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'transaction.slip_number',
    }),
  })
  slipNumber!: string;

  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'transaction.category',
    }),
  })
  @IsEnum(Category, {
    message: i18nValidationMessage('validation.rules.CATEGORY', {
      message: 'transaction.category',
    }),
  })
  @ApiProperty({
    example: 'incoming',
    type: 'enum',
  })
  category!: Category;

  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'transaction.input_type',
    }),
  })
  @IsEnum(InputType, {
    message: i18nValidationMessage('validation.rules.INPUT_TYPE', {
      message: 'transaction.input_type',
    }),
  })
  @ApiProperty({
    example: 'incoming',
    type: 'enum',
  })
  inputType!: InputType;

  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'transaction.input_type',
    }),
  })
  // @IsEnum(SlipStatus, {
  //   message: i18nValidationMessage('validation.rules.STATUS', {
  //     message: 'transaction.status',
  //   }),
  // })
  @ApiProperty({
    example: '작업예정',
    type: 'enum',
  })
  status!: SlipStatus | SlipStatus[];

  createWorker!: string;

  @Expose({ name: 'completed_at' })
  @IsOptional()
  completedAt?: boolean | Date | null = null;
}
