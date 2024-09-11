import { PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateWaveDto } from './create-wave.dto';

export class FindWaveDto extends PartialType(CreateWaveDto) {
  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  status?: string;

  @IsOptional()
  orderType?: string;
}
