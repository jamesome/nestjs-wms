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
}
