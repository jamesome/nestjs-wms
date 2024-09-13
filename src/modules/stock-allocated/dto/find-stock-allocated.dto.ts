import { IsOptional } from 'class-validator';

export class FindStockAllocatedDto {
  @IsOptional()
  ids!: number[];
}
