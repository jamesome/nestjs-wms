import { Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { CONNECTION } from 'src/common/constants';
// import { instanceToPlain } from 'class-transformer';

@Injectable()
export class InventoryItemService {
  private inventoryItemRepository: Repository<InventoryItem>;

  constructor(@Inject(CONNECTION) private readonly dataSource: DataSource) {
    this.inventoryItemRepository = this.dataSource.getRepository(InventoryItem);
  }

  // 로케이션 별 inventory-item(with. item, lot)
  async findAll(warehouseId: number, locationId: number) {
    const inventoryItems = await this.inventoryItemRepository.find({
      relations: { item: true, lot: true },
      where: {
        location: {
          id: locationId,
          zone: {
            warehouse: {
              id: warehouseId,
            },
          },
        },
      },
    });

    return inventoryItems;
  }

  // 점유재고를 제외한 가용재고
  async getAvailableStockList(warehouseId: number) {
    return await this.inventoryItemRepository
      .createQueryBuilder('inventoryItem')
      .leftJoinAndSelect('inventoryItem.location', 'location')
      .leftJoinAndSelect('location.zone', 'zone')
      .leftJoinAndSelect(
        'stock_allocated',
        'sa',
        'inventoryItem.item_id = sa.item_id AND inventoryItem.location_id = sa.location_id AND (inventoryItem.lot_id = sa.lot_id OR inventoryItem.lot_id IS NULL)',
      )
      .select([
        'zone.id as zoneId',
        'inventoryItem.item_id AS itemId',
        'inventoryItem.location_id AS locationId',
        'inventoryItem.lot_id AS lotId',
        'inventoryItem.quantity - COALESCE(SUM(sa.quantity), 0) AS availableQuantity',
      ])
      .where('zone.warehouse_id = :warehouseId', { warehouseId })
      .groupBy(
        'inventoryItem.itemId, inventoryItem.locationId, inventoryItem.lotId, inventoryItem.quantity',
      )
      .having('availableQuantity > 0')
      .orderBy({
        'inventoryItem.itemId': 'ASC',
        'inventoryItem.quantity': 'ASC',
      })
      .getRawMany();
  }
}
