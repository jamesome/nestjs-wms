import { Expose } from 'class-transformer';
import { TimestampedEntity } from 'src/modules/timestamped-entity';
import { Transaction } from 'src/modules/transaction/entities/transaction.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('transaction_group')
export class TransactionGroup extends TimestampedEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Expose({ name: 'transaction_number' })
  @Column('varchar', {
    name: 'transaction_number',
    length: 50,
    unique: true,
    nullable: false,
    comment: '전문번호(규칙에 따른 생성)',
  })
  transactionNumber!: string;

  @Expose({ name: 'transactions' })
  @OneToMany(() => Transaction, (transaction) => transaction.transactionGroup)
  transactions!: Relation<Transaction>[];
}
