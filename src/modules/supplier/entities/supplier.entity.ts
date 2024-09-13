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

@Entity()
@Unique(['name'])
export class Supplier {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100, unique: true })
  name!: string;

  @OneToMany(() => Lot, (lot) => lot.supplier)
  lots!: Relation<Lot>[];

  @OneToMany(
    () => TransactionItem,
    (transactionItem) => transactionItem.supplier,
  )
  transactions!: Relation<TransactionItem>[];
}
