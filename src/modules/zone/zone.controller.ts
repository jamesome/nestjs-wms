import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  HttpCode,
} from '@nestjs/common';
import { ZoneService } from './zone.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiQuery,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { FindLocationDto } from '../location/dto/find-location.dto';
import { HttpStatus } from 'src/common/constants';

@Controller(['zones', 'warehouses/:warehouseId/zones'])
@ApiTags('Zone API')
export class ZoneController {
  constructor(private readonly zoneService: ZoneService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Created' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnprocessableEntityResponse({
    description: 'Unprocessable Entity',
  })
  async create(@Body() createZoneDto: CreateZoneDto) {
    return await this.zoneService.create(createZoneDto);
  }

  @Get()
  @ApiQuery({ name: 'id', type: 'number' })
  @ApiQuery({ name: 'name', type: 'string' })
  async findAll(
    @Param('warehouseId') warehouseId: number | null,
    @Query() findLocationDto: FindLocationDto,
  ) {
    return await this.zoneService.findAll(warehouseId, findLocationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.zoneService.findOne(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: number, @Body() updateZoneDto: UpdateZoneDto) {
    return await this.zoneService.update(id, updateZoneDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: number) {
    return await this.zoneService.remove(id);
  }
}
