import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { LotService } from './lot.service';
import { CreateLotDto } from './dto/create-lot.dto';
import { FindLotDto } from './dto/find-lot.dto';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('lot')
@ApiExcludeController()
export class LotController {
  constructor(private readonly lotService: LotService) {}

  @Post()
  async create(@Body() createLotDto: CreateLotDto) {
    return await this.lotService.create(createLotDto);
  }

  @Get()
  async findAll(findLotDto: FindLotDto) {
    return await this.lotService.findAll(findLotDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lotService.findOne(+id);
  }
}
