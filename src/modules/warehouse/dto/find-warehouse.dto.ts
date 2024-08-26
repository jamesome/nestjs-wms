import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateWarehouseDto } from './create-warehouse.dto';
import { IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';

export class FindWarehouseDto extends PartialType(CreateWarehouseDto) {
  @IsOptional()
  id?: number;

  // TODO: 추후, User로 대체
  @IsOptional()
  @Expose({ name: 'create_worker' })
  @ApiProperty({
    required: false,
    description: '창고 생성자',
    example: '홍길동',
    maxLength: 20,
  })
  createWorker?: string;
}
