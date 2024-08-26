import { PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';
import { CreateWaveDto } from './create-wave.dto';

export class FindWaveDto extends PartialType(CreateWaveDto) {
  @IsOptional()
  @Expose({ name: 'created_at' })
  createdAt?: Date;

  @IsOptional()
  @Expose({ name: 'status' })
  status?: string;

  @IsOptional()
  @Expose({ name: 'order_type' })
  orderType?: string;
}
