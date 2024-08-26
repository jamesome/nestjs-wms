import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateWarehouseDto } from './create-warehouse.dto';

export class CreateWarehouseArrayDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWarehouseDto)
  items!: CreateWarehouseDto[];
}
