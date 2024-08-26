import { PartialType } from '@nestjs/swagger';
import { CreateTransactionDto } from './create-transaction.dto';
import { IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';
import { Category, InputType, SlipStatus } from 'src/modules/enum';

export class FindTransactionDto extends PartialType(CreateTransactionDto) {
  @IsOptional()
  include?: string | null;

  @IsOptional()
  @Expose({ name: 'start_date' })
  startDate?: Date;

  @IsOptional()
  @Expose({ name: 'end_date' })
  endDate?: Date;

  @IsOptional()
  @Expose({ name: 'input_type' })
  inputType?: InputType;

  @IsOptional()
  @Expose({ name: 'status' })
  status?: SlipStatus | SlipStatus[];

  @IsOptional()
  @Expose({ name: 'category' })
  category?: Category;

  @IsOptional()
  @Expose({ name: 'item_name' })
  itemName?: string;

  @IsOptional()
  @Expose({ name: 'number' })
  number?: string;

  @IsOptional()
  @Expose({ name: 'recipient' })
  recipient?: string;

  @IsOptional()
  @Expose({ name: 'contact' })
  contact?: string;

  @IsOptional()
  @Expose({ name: 'created_at' })
  createdAt?: boolean;

  @IsOptional()
  @Expose({ name: 'completed_at' })
  completedAt?: boolean;

  @IsOptional()
  @Expose({ name: 'order_type' })
  orderType?: string;

  @IsOptional()
  @Expose({ name: 'ids' })
  ids?: number[];
}
