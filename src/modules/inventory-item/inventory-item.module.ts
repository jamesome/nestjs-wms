import { Module } from '@nestjs/common';
import { InventoryItemController } from './inventory-item.controller';
import { InventoryItemService } from './inventory-item.service';

@Module({
  controllers: [InventoryItemController],
  providers: [InventoryItemService],
})
export class InventoryItemModule {}
