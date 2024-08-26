import { Controller, Get, Param } from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InventoryItemService } from './inventory-item.service';

@Controller([
  'inventory-items',
  'warehouses/:warehouseId/locations/:locationId/inventory-items',
])
@ApiTags('InventoryItem API')
export class InventoryItemController {
  constructor(private readonly inventoryItemService: InventoryItemService) {}

  @Get()
  @ApiOperation({ summary: '로케이션별 재고품목(재고를 가진 품목) 조회' })
  async findAll(
    @Param('warehouseId') warehouseId: number,
    @Param('locationId') locationId: number,
  ) {
    return await this.inventoryItemService.findAll(warehouseId, locationId);
  }
}
