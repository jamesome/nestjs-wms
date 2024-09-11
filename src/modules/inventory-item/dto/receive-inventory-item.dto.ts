import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { CreateItemSerialDto } from 'src/modules/item-serial/dto/create-item-serial.dto';
import { StockStatus } from 'src/modules/enum';
import { I18nValidate } from 'src/common/decorators/i18n-validate.decorator';

export class ReceiveInventoryItemDto {
  @I18nValidate(IsNotEmpty)
  itemId!: number;

  @I18nValidate(IsNotEmpty)
  locationId!: number;

  @I18nValidate(IsNotEmpty)
  @I18nValidate(IsInt)
  @I18nValidate(Min, 1)
  quantity!: number;

  @I18nValidate(IsNotEmpty)
  @I18nValidate(IsEnum, StockStatus)
  status!: StockStatus;

  @I18nValidate(IsNotEmpty)
  @IsOptional()
  supplierId!: number;

  @IsOptional()
  @I18nValidate(IsString)
  @I18nValidate(MaxLength, 50)
  lotNo?: string | null;

  @IsOptional()
  @I18nValidate(IsDate)
  @Type(() => Date)
  expirationDate?: Date | null = null;

  @IsOptional()
  @Type(() => CreateItemSerialDto)
  itemSerial!: CreateItemSerialDto;

  @IsOptional()
  operationTypeId!: number;

  @IsOptional()
  remark?: string;
}
