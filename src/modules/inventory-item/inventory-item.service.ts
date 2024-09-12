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
        'inventoryItem.itemId = sa.itemId AND inventoryItem.locationId = sa.locationId AND (inventoryItem.lotId = sa.lotId OR inventoryItem.lotId IS NULL)',
      )
      .select([
        'zone.id as zoneId',
        'inventoryItem.itemId AS itemId',
        'inventoryItem.locationId AS locationId',
        'inventoryItem.lotId AS lotId',
        'inventoryItem.quantity - COALESCE(SUM(sa.quantity), 0) AS availableQuantity',
      ])
      .where('zone.warehouseId = :warehouseId', { warehouseId })
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
