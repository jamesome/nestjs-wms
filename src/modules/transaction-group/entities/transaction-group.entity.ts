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

@Entity('transaction_group')
@Unique(['transactionNumber'])
export class TransactionGroup extends TimestampedEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', {
    name: 'transaction_number',
    length: 50,
    unique: true,
    nullable: false,
    comment: '전문번호(규칙에 따른 생성)',
  })
  transactionNumber!: string;

  @OneToMany(() => Transaction, (transaction) => transaction.transactionGroup)
  transactions!: Relation<Transaction>[];
}
