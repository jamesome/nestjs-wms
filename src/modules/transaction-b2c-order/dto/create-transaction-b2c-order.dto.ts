import { Optional } from '@nestjs/common';
import { Expose } from 'class-transformer';
import { IsInt, IsNotEmpty, MaxLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateTransactionB2cOrderDto {
  @Expose({ name: 'transaction_id' })
  transactionId!: number;

  @Expose({ name: 'number' })
  @Optional()
  @MaxLength(200, {
    message: i18nValidationMessage('validation.rules.MAX_LENGTH', {
      message: 'transaction_b2c_order.number',
    }),
  })
  number?: string;

  @Expose({ name: 'shop_id' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'transaction_b2c_order.shop_id',
    }),
  })
  @IsInt({
    message: i18nValidationMessage('validation.rules.IS_INT', {
      message: 'transaction_b2c_order.shop_id',
    }),
  })
  shopId!: number;

  @Expose({ name: 'recipient' })
  @MaxLength(200, {
    message: i18nValidationMessage('validation.rules.MAX_LENGTH', {
      message: 'transaction_b2c_order.recipient',
    }),
  })
  recipient?: string;

  @Expose({ name: 'contact' })
  @Optional()
  @MaxLength(20, {
    message: i18nValidationMessage('validation.rules.MAX_LENGTH', {
      message: 'transaction_b2c_order.contact',
    }),
  })
  contact?: string;

  @Expose({ name: 'post_code' })
  @Optional()
  @MaxLength(6, {
    message: i18nValidationMessage('validation.rules.MAX_LENGTH', {
      message: 'transaction_b2c_order.post_code',
    }),
  })
  postCode?: string;

  @Expose({ name: 'address' })
  @Optional()
  @MaxLength(500, {
    message: i18nValidationMessage('validation.rules.MAX_LENGTH', {
      message: 'address.number',
    }),
  })
  address?: string;

  @Expose({ name: 'detail_address' })
  @Optional()
  @MaxLength(500, {
    message: i18nValidationMessage('validation.rules.MAX_LENGTH', {
      message: 'transaction_b2c_order.detail_address',
    }),
  })
  detailAddress?: string;

  @Expose({ name: 'invoice_number' })
  @Optional()
  @MaxLength(200, {
    message: i18nValidationMessage('validation.rules.MAX_LENGTH', {
      message: 'transaction_b2c_order.invoice_number',
    }),
  })
  invoiceNumber?: string;

  @Expose({ name: 'ordered_at' })
  @Optional()
  orderedAt?: Date;
}
