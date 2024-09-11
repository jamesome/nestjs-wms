import { PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateWarehouseDto } from './create-warehouse.dto';

export class FindWarehouseDto extends PartialType(CreateWarehouseDto) {
  @IsOptional()
  id?: number;

  // TODO: 추후, User로 대체
  @IsOptional()
  createWorker?: string;
}
