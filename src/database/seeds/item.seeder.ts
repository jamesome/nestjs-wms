import { ItemCode } from 'src/modules/item-code/entities/item-code.entity';
import { Item } from 'src/modules/item/entities/item.entity';
import { Shipper } from 'src/modules/shipper/entities/shipper.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class ItemSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const itemRepository = dataSource.getRepository(Item);
    const itemCodeRepository = dataSource.getRepository(ItemCode);

    const itemCodeFactory = factoryManager.get(ItemCode);
    const shipperFactory = factoryManager.get(Shipper);
    const shippers = await shipperFactory.saveMany(5);
    const itemFactory = factoryManager.get(Item);

    await Promise.all(
      shippers.map(async (shipper) => {
        const items: Item[] = [];
        for (let i = 0; i < 5; i++) {
          const item = await itemFactory.make({ shipper });
          items.push(item);
        }

        const newItems = await itemRepository.save(items);

        await Promise.all(
          newItems.map(async (item) => {
            const itemCodes: ItemCode[] = [];
            for (let j = 0; j < 5; j++) {
              const itemCode = await itemCodeFactory.make({ item });
              itemCodes.push(itemCode);
            }

            await itemCodeRepository.save(itemCodes);
          }),
        );
      }),
    );
  }
}
