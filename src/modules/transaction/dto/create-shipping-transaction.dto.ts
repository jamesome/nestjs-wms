import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { I18nValidate } from 'src/common/decorators/validations/i18n-validate.decorator';
import { CreateTransactionB2cOrderDto } from 'src/modules/transaction-b2c-order/dto/create-transaction-b2c-order.dto';
import { CreateTransactionItemDto } from 'src/modules/transaction-item/dto/create-transaction-item.dto';

export class CreateShippingTransactionDto {
  @I18nValidate(IsNotEmpty)
  slipNumber!: string;

  @I18nValidate(IsNotEmpty)
  @ValidateNested()
  @Type(() => CreateTransactionB2cOrderDto)
  order!: CreateTransactionB2cOrderDto;

  @I18nValidate(IsNotEmpty)
  @I18nValidate(IsArray)
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionItemDto)
  items!: CreateTransactionItemDto[];
}
