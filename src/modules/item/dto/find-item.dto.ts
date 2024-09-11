import { IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateItemDto } from './create-item.dto';

export class FindItemDto extends PartialType(CreateItemDto) {
  @IsOptional()
  itemName?: string;

  @IsOptional()
  itemCode?: string;

  @IsOptional()
  include?: string | null;

  @IsOptional()
  locationId?: number;

  @IsOptional()
  shipperName?: string;
}
