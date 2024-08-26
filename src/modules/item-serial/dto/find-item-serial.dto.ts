import { PartialType } from '@nestjs/swagger';
import { CreateItemSerialDto } from './create-item-serial.dto';

export class FindItemSerialDto extends PartialType(CreateItemSerialDto) {}
