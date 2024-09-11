import { Lot } from 'src/modules/lot/entities/lot.entity';
import { TransactionItem } from 'src/modules/transaction-item/entities/transaction-item.entity';
import { Unique } from 'typeorm';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity({ name: 'supplier' })
@Unique(['name'])
export class Supplier {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', {
    name: 'name',
    length: 100,
    unique: true,
    nullable: false,
    comment: '공급처명',
  })
  name!: string;

  @OneToMany(() => Lot, (lot) => lot.supplier)
  lots!: Relation<Lot>[];

  @OneToMany(
    () => TransactionItem,
    (transactionItem) => transactionItem.supplier,
  )
  transactions!: Relation<TransactionItem>[];
}
