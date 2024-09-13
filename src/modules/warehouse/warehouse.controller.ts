import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  HttpCode,
} from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiQuery,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { FindWarehouseDto } from './dto/find-warehouse.dto';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { HttpStatus } from 'src/common/constants';
import { Warehouse } from './entities/warehouse.entity';
import { EntityByIdPipe } from 'src/common/pipes/entity-by-id.pipe';

@Controller('warehouses')
@ApiTags('Warehouse API')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Created', type: Warehouse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnprocessableEntityResponse({
    description: 'Unprocessable Entity',
  })
  async create(@Body() createWarehouseDto: CreateWarehouseDto) {
    return await this.warehouseService.create(createWarehouseDto);
  }

  @Get()
  @ApiQuery({ name: 'id', type: 'number' })
  @ApiQuery({ name: 'name', type: 'string' })
  async findAll(
    @Paginate() query: PaginateQuery,
    @Query() findWarehouseDto: FindWarehouseDto,
  ) {
    return await this.warehouseService.findAll(query, findWarehouseDto);
  }

  @Get(':id')
  async findOne(@Param('id', EntityByIdPipe(Warehouse)) warehouse: Warehouse) {
    return warehouse;
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({
    type: UpdateWarehouseDto,
  })
  @ApiNoContentResponse({ description: 'SUCCESS' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnprocessableEntityResponse({
    description: 'Unprocessable Entity',
  })
  async update(
    @Param('id') id: number,
    @Body() updateWarehouseDto: UpdateWarehouseDto,
  ) {
    return await this.warehouseService.update(id, updateWarehouseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'SUCCESS' })
  async remove(@Param('id') id: number) {
    return await this.warehouseService.remove(id);
  }
}
