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
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiQuery,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { HttpStatus } from 'src/common/constants';
import { ZoneService } from './zone.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { FindZoneDto } from './dto/find-zone.dto';
import { EntityByIdPipe } from 'src/common/pipes/entity-by-id.pipe';
import { Zone } from './entities/zone.entity';

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
    @Query() findZoneDto: FindZoneDto,
  ) {
    return await this.zoneService.findAll(warehouseId, findZoneDto);
  }

  @Get(':id')
  async findOne(@Param('id', EntityByIdPipe(Zone)) zone: Zone) {
    return zone;
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
