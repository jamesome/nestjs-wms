import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ItemService } from './item.service';
import { FindItemDto } from './dto/find-item.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { HttpStatus } from 'src/common/constants';

@Controller(['items', 'warehouses/:warehouseId/items'])
@ApiTags('Item API')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  async create(@Body() createItemDto: CreateItemDto) {
    return await this.itemService.create(createItemDto);
  }

  @Get()
  async find(
    @Paginate() query: PaginateQuery,
    @Param('warehouseId') warehouseId: number | null,
    @Query() findItemDto: FindItemDto,
  ) {
    return await this.itemService.find(query, warehouseId, findItemDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.itemService.findOne(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: number, @Body() updateItemDto: UpdateItemDto) {
    return await this.itemService.update(id, updateItemDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: number) {
    return await this.itemService.remove(id);
  }
}
