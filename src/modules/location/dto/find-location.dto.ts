import { PartialType } from '@nestjs/swagger';
import { CreateLocationDto } from './create-location.dto';
import { IsOptional } from 'class-validator';

export class FindLocationDto extends PartialType(CreateLocationDto) {
  // TODO: 추후, User로 대체
  @IsOptional()
  createWorker?: string;

  @IsOptional()
  zoneName?: string;

  @IsOptional()
  warehouseId?: number;
}
