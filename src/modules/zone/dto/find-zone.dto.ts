import { PartialType } from '@nestjs/swagger';
import { CreateZoneDto } from './create-zone.dto';

export class FindZoneDto extends PartialType(CreateZoneDto) {}
