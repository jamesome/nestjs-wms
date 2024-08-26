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
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { ApiExcludeController } from '@nestjs/swagger';
import { HttpStatus } from 'src/common/constants';

@Controller('suppliers')
@ApiExcludeController()
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.supplierService.create(createSupplierDto);
  }

  @Get()
  findAll() {
    return this.supplierService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.supplierService.findOne(+id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  update(
    @Param('id') id: number,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.supplierService.update(id, updateSupplierDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number) {
    return this.supplierService.remove(id);
  }
}
