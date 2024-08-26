import { Controller, Get, Param, Query } from '@nestjs/common';
import { ShipperService } from './shipper.service';
import { FindShipperDto } from './dto/find-shipper.dto';

@Controller('shippers')
export class ShipperController {
  constructor(private readonly shipperService: ShipperService) {}

  @Get()
  async findAll(@Query() findShipperDto: FindShipperDto) {
    return await this.shipperService.findAll(findShipperDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.shipperService.findOne(id);
  }
}
