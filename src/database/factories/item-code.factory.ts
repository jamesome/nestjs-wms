import { ItemCode } from 'src/modules/item-code/entities/item-code.entity';
import { setSeederFactory } from 'typeorm-extension';

export const ItemCodeFactory = setSeederFactory(ItemCode, (faker) => {
  const itemCode = new ItemCode();
  itemCode.code = faker.string.alpha({
    length: 5,
    casing: 'upper',
    exclude: ['A'],
  });

  return itemCode;
});
