import { PartialType } from '@nestjs/swagger';
import { CreateTransactionDto } from './create-transaction.dto';
import { IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Category, InputType, SlipStatus } from 'src/modules/enum';
import { I18nValidate } from 'src/common/decorators/validations/i18n-validate.decorator';
import { TransformStringToNumber } from 'src/common/decorators/transform-string-to-number';
import { MaxDateRange } from 'src/common/decorators/validations/max-date-range.decorator';

export class FindTransactionDto extends PartialType(CreateTransactionDto) {
  // 출고지시일자(created_at), 출고확정일자(completed_at)
  dateType!: string;

  @IsOptional()
  @I18nValidate(MaxDateRange, 'endDate', 31)
  @Type(() => Date)
  startDate!: Date;

  @IsOptional()
  @Type(() => Date)
  endDate!: Date;

  @IsOptional()
  inputType?: InputType;

  @IsOptional()
  status?: SlipStatus | SlipStatus[];

  @IsOptional()
  category?: Category;

  @IsOptional()
  itemName?: string;

  @IsOptional()
  number?: string;

  @IsOptional()
  recipient?: string;

  @IsOptional()
  contact?: string;

  @IsOptional()
  orderType?: string;

  @IsOptional()
  ids?: number[];

  @IsOptional()
  @TransformStringToNumber()
  @I18nValidate(Min, 1)
  ordersToProcess?: number; // 작업대상 수량(total orders to process)
}
