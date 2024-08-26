import { Supplier } from 'src/modules/supplier/entities/supplier.entity';
import { setSeederFactory } from 'typeorm-extension';

export const SupplierFactory = setSeederFactory(Supplier, (faker) => {
  const supplier = new Supplier();
  supplier.name = faker.person.fullName();

  return supplier;
});
