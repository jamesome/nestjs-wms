import { PartialType } from '@nestjs/swagger';
import { CreateWaveDto } from './create-wave.dto';

export class UpdateWaveDto extends PartialType(CreateWaveDto) {}
