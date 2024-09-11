import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Patch,
} from '@nestjs/common';
import { StockAllocationRuleService } from './stock-allocation-rule.service';
import { CreateStockAllocationRuleDto } from './dto/create-stock-allocation-rule.dto';
import { UpdateStockAllocationRuleDto } from './dto/update-stock-allocation-rule.dto';
import { ApiTags } from '@nestjs/swagger';
import { UpdatePriorityDto } from './dto/update-priority.dto';

@Controller('warehouses/:warehouseId/stock-allocation-rules')
@ApiTags('StockAllocationRule API')
export class StockAllocationRuleController {
  constructor(
    private readonly stockAllocationRuleService: StockAllocationRuleService,
  ) {}

  @Post()
  async create(
    @Param('warehouseId') warehouseId: number,
    @Body('data') createStockAllocationRuleDto: CreateStockAllocationRuleDto,
  ) {
    return await this.stockAllocationRuleService.create(
      warehouseId,
      createStockAllocationRuleDto,
    );
  }

  @Get()
  async findAll(@Param('warehouseId') warehouseId: number) {
    return await this.stockAllocationRuleService.findAll(warehouseId);
  }

  @Get(':id')
  async findOne(
    @Param('warehouseId') warehouseId: number,
    @Param('id') id: number,
  ) {
    return this.stockAllocationRuleService.findOne(warehouseId, id);
  }

  @Put(':id')
  async update(
    @Param('warehouseId') warehouseId: number,
    @Param('id') id: number,
    @Body('data') updateStockAllocationRuleDto: UpdateStockAllocationRuleDto,
  ) {
    return this.stockAllocationRuleService.update(
      warehouseId,
      id,
      updateStockAllocationRuleDto,
    );
  }

  @Delete(':id')
  async remove(
    @Param('warehouseId') warehouseId: number,
    @Param('id') id: number,
  ) {
    return this.stockAllocationRuleService.remove(warehouseId, id);
  }

  @Patch(':id')
  async updatePriority(
    @Param('warehouseId') warehouseId: number,
    @Param('id') id: number,
    @Body('data') updatePriorityDto: UpdatePriorityDto,
  ) {
    return this.stockAllocationRuleService.updatePriority(
      warehouseId,
      id,
      updatePriorityDto,
    );
  }
}
