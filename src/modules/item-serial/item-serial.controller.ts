import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
} from '@nestjs/common';
import { ItemSerialService } from './item-serial.service';
import { CreateItemSerialDto } from './dto/create-item-serial.dto';
import { UpdateItemSerialDto } from './dto/update-item-serial.dto';
import { ApiExcludeController } from '@nestjs/swagger';
import { HttpStatus } from 'src/common/constants';

@Controller('item-serial')
@ApiExcludeController()
export class ItemSerialController {
  constructor(private readonly itemSerialService: ItemSerialService) {}

  @Post()
  create(@Body() createItemSerialDto: CreateItemSerialDto) {
    return this.itemSerialService.create(createItemSerialDto);
  }

  @Get()
  findAll() {
    return this.itemSerialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemSerialService.findOne(+id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  update(
    @Param('id') id: string,
    @Body() updateItemSerialDto: UpdateItemSerialDto,
  ) {
    return this.itemSerialService.update(+id, updateItemSerialDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.itemSerialService.remove(+id);
  }
}
