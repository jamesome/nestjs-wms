import { PartialType } from '@nestjs/swagger';
import { CreateWaveTransactionDto } from './create-wave-transaction.dto';

export class UpdateWaveTransactionDto extends PartialType(
  CreateWaveTransactionDto,
) {}
