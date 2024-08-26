import { Optional } from '@nestjs/common';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { SlipStatus } from 'src/modules/enum';
import { CreateTransactionB2cOrderDto } from 'src/modules/transaction-b2c-order/dto/create-transaction-b2c-order.dto';
import { CreateTransactionItemDto } from 'src/modules/transaction-item/dto/create-transaction-item.dto';

export class InstructShippingTransactionDto {
  @Expose({ name: 'slip_number' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'transaction.slip_number',
    }),
  })
  slipNumber!: string;

  @Optional()
  status!: SlipStatus;

  @Expose({ name: 'order' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'transaction.order',
    }),
  })
  @ValidateNested()
  @Type(() => CreateTransactionB2cOrderDto)
  order!: CreateTransactionB2cOrderDto;

  @Expose({ name: 'items' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'transaction.items',
    }),
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionItemDto)
  items!: CreateTransactionItemDto[];
}
