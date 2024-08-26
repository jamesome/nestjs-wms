import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { StockStatus } from 'src/modules/enum';

export class CreateTransactionItemDto {
  @Expose({ name: 'transaction_id' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'transaction_item.transaction_id',
    }),
  })
  @ApiProperty({
    required: true,
    description: 'transaction 일련번호',
    example: 112,
  })
  transactionId!: number;

  @Expose({ name: 'item_id' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'transaction_item.item_id',
    }),
  })
  @ApiProperty({
    required: true,
    description: '품목 일련번호',
    example: 112,
  })
  itemId?: number;
  id?: number;

  @Expose({ name: 'location_departure_id' })
  @IsOptional()
  locationDepartureId?: number | null;

  @Expose({ name: 'location_arrival_id' })
  @IsOptional()
  locationArrivalId?: number | null;

  @Expose({ name: 'lot_id' })
  @IsOptional()
  lotId?: number | null;

  @Expose({ name: 'supplier_id' })
  @IsOptional()
  supplierId?: number | null;

  @Expose({ name: 'operation_type_id' })
  operationTypeId?: number | null;

  @IsNotEmpty({
    message: i18nValidationMessage('validation.rules.IS_NOT_EMPTY', {
      message: 'transaction_item.quantity',
    }),
  })
  @IsInt({
    message: i18nValidationMessage('validation.rules.IS_INT', {
      message: 'transaction_item.quantity',
    }),
  })
  @Min(1, {
    message: i18nValidationMessage('validation.rules.MIN', {
      message: 'transaction_item.quantity',
    }),
  })
  quantity!: number;

  @IsInt({
    message: i18nValidationMessage('validation.rules.IS_INT', {
      message: 'transaction_item.price',
    }),
  })
  price?: number | null;

  @IsEnum(StockStatus, {
    message: i18nValidationMessage('validation.rules.STOCK_STATUS', {
      message: 'inventory_item.status',
    }),
  })
  @ApiProperty({
    example: 'normal',
    type: 'enum',
  })
  status?: StockStatus;

  @IsOptional()
  @ApiProperty({
    required: false,
    description: '비고',
    example: '입고입니다.',
  })
  remark?: string | null;
}
