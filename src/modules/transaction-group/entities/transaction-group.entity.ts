import { TimestampedEntity } from 'src/modules/timestamped-entity';
import { Transaction } from 'src/modules/transaction/entities/transaction.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['transactionNumber'])
export class TransactionGroup extends TimestampedEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50, unique: true })
  transactionNumber!: string;

  @OneToMany(() => Transaction, (transaction) => transaction.transactionGroup)
  transactions!: Relation<Transaction>[];
}
