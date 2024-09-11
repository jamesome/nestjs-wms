import {
  Controller,
  Get,
  // Post,
  // Body,
  Param,
  // Delete,
  Query,
  // Put,
  // HttpCode,
} from '@nestjs/common';
import { OperationTypeService } from './operation-type.service';
// import { CreateOperationTypeDto } from './dto/create-operation-type.dto';
// import { UpdateOperationTypeDto } from './dto/update-operation-type.dto';
import { FindOperationTypeDto } from './dto/find-operation-type.dto';
import { ApiTags } from '@nestjs/swagger';
// import { HttpStatus } from 'src/common/constants';
import { OperationType } from './entities/operation-type.entity';
import { EntityByIdPipe } from 'src/common/pipes/entity-by-id.pipe';

@Controller('operation-types')
@ApiTags('OperationType API')
export class OperationTypeController {
  constructor(private readonly operationTypeService: OperationTypeService) {}

  // @Post()
  // create(@Body() createOperationTypeDto: CreateOperationTypeDto) {
  //   return this.operationTypeService.create(createOperationTypeDto);
  // }

  @Get()
  async findAll(@Query() findOperationTypeDto: FindOperationTypeDto) {
    return await this.operationTypeService.findAll(findOperationTypeDto);
  }

  @Get(':id')
  findOne(
    @Param('id', EntityByIdPipe(OperationType))
    operationType: OperationType,
  ) {
    return operationType;
  }

  // @Put(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // update(
  //   @Param('id') id: number,
  //   @Body() updateOperationTypeDto: UpdateOperationTypeDto,
  // ) {
  //   return this.operationTypeService.update(id, updateOperationTypeDto);
  // }

  // @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // remove(@Param('id') id: number) {
  //   return this.operationTypeService.remove(id);
  // }
}
