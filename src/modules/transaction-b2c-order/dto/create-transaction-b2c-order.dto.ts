import { Optional } from '@nestjs/common';
import { IsInt, IsNotEmpty, MaxLength } from 'class-validator';
import { I18nValidate } from 'src/common/decorators/i18n-validate.decorator';

export class CreateTransactionB2cOrderDto {
  transactionId!: number;

  @Optional()
  @I18nValidate(MaxLength, 200)
  number!: string;

  @I18nValidate(IsNotEmpty)
  @I18nValidate(IsInt)
  shopId!: number;

  @I18nValidate(MaxLength, 200)
  recipient!: string;

  @Optional()
  @I18nValidate(MaxLength, 20)
  contact?: string;

  @Optional()
  @I18nValidate(MaxLength, 6)
  postCode!: string;

  @Optional()
  @I18nValidate(MaxLength, 500)
  address!: string;

  @Optional()
  @I18nValidate(MaxLength, 500)
  detailAddress!: string;

  @Optional()
  @I18nValidate(MaxLength, 200)
  invoiceNumber?: string;

  @Optional()
  orderedAt!: Date;
}
