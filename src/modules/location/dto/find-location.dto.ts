import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateLocationDto } from './create-location.dto';
import { IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';

export class FindLocationDto extends PartialType(CreateLocationDto) {
  // TODO: 추후, User로 대체
  @IsOptional()
  @Expose({ name: 'create_worker' })
  @ApiProperty({
    required: false,
    description: '로케이션 생성자',
    example: '홍길동',
    maxLength: 50,
  })
  createWorker?: string;

  @IsOptional()
  @Expose({ name: 'zone_name' })
  zoneName!: string;

  @IsOptional()
  @Expose({ name: 'warehouse_id' })
  warehouseId!: number;
}
