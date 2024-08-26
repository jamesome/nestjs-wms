import { PartialType } from '@nestjs/swagger';
import { CreateShipperDto } from './create-shipper.dto';

export class FindShipperDto extends PartialType(CreateShipperDto) {}
