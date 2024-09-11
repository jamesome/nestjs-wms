import { PartialType } from '@nestjs/swagger';
import { CreateTransactionDto } from './create-transaction.dto';
import { IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Category, InputType, SlipStatus } from 'src/modules/enum';
import { IsWithinMaxRange } from 'src/common/decorators/is-within-max-range';
import { I18nValidate } from 'src/common/decorators/i18n-validate.decorator';
import { TransformStringToNumber } from 'src/common/decorators/transform-string-to-number';

export class FindTransactionDto extends PartialType(CreateTransactionDto) {
  // 출고지시일자(created_at), 출고확정일자(completed_at)
  dateType!: string;

  @IsOptional()
  @Type(() => Date)
  startDate!: Date;

  @IsOptional()
  @I18nValidate(IsWithinMaxRange, 'startDate', 30)
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
