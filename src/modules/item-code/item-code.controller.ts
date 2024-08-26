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
import { ItemCodeService } from './item-code.service';
import { CreateItemCodeDto } from './dto/create-item-code.dto';
import { UpdateItemCodeDto } from './dto/update-item-code.dto';
import { ApiExcludeController } from '@nestjs/swagger';
import { HttpStatus } from 'src/common/constants';

@Controller('item-codes')
@ApiExcludeController()
export class ItemCodeController {
  constructor(private readonly itemCodeService: ItemCodeService) {}

  @Post()
  create(@Body() createItemCodeDto: CreateItemCodeDto) {
    return this.itemCodeService.create(createItemCodeDto);
  }

  @Get()
  findAll() {
    return this.itemCodeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemCodeService.findOne(+id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  update(
    @Param('id') id: string,
    @Body() updateItemCodeDto: UpdateItemCodeDto,
  ) {
    return this.itemCodeService.update(+id, updateItemCodeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.itemCodeService.remove(+id);
  }
}
