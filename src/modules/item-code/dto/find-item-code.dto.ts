import { PartialType } from '@nestjs/swagger';
import { CreateItemCodeDto } from './create-item-code.dto';

export class FindItemCodeDto extends PartialType(CreateItemCodeDto) {}
