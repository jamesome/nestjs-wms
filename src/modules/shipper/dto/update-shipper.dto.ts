import { PartialType } from '@nestjs/swagger';
import { CreateShipperDto } from './create-shipper.dto';

export class UpdateShipperDto extends PartialType(CreateShipperDto) {}
