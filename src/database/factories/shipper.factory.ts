import { Shipper } from 'src/modules/shipper/entities/shipper.entity';
import { setSeederFactory } from 'typeorm-extension';

export const ItemFactory = setSeederFactory(Shipper, (faker) => {
  const shipper = new Shipper();
  shipper.name = faker.person.fullName();

  return shipper;
});
