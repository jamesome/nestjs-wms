import { Item } from 'src/modules/item/entities/item.entity';
import { setSeederFactory } from 'typeorm-extension';

export const ItemFactory = setSeederFactory(Item, (faker) => {
  const item = new Item();
  item.name = faker.person.fullName();
  item.property = faker.commerce.productAdjective();

  return item;
});
