import { PartialType } from '@nestjs/swagger';
import { CreateTransactionItemDto } from './create-transaction-item.dto';

export class UpdateTransactionItemDto extends PartialType(
  CreateTransactionItemDto,
) {}
