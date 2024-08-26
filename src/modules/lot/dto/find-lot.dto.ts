import { PartialType } from '@nestjs/swagger';
import { CreateLotDto } from './create-lot.dto';

export class FindLotDto extends PartialType(CreateLotDto) {}
