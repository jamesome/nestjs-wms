import { PartialType } from '@nestjs/swagger';
import { CreateItemDto } from './create-item.dto';
import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class FindItemDto extends PartialType(CreateItemDto) {
  @IsOptional()
  @Expose({ name: 'item_name' })
  itemName!: string;

  @IsOptional()
  @Expose({ name: 'item_code' })
  itemCode!: string;

  @IsOptional()
  include?: string | null;

  @IsOptional()
  @Expose({ name: 'location_id' })
  locationId?: number;

  @IsOptional()
  @Expose({ name: 'shipper_name' })
  shipperName?: string;
}
