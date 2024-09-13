import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Category, InputType, SlipStatus } from 'src/modules/enum';
import { TransactionB2cOrder } from 'src/modules/transaction-b2c-order/entities/transaction-b2c-order.entity';
import { TransactionGroup } from 'src/modules/transaction-group/entities/transaction-group.entity';
import { TransactionItem } from 'src/modules/transaction-item/entities/transaction-item.entity';
import { WaveTransaction } from 'src/modules/wave-transaction/entities/wave-transaction.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(
    () => TransactionGroup,
    (transactionGroup) => transactionGroup.transactions,
  )
  @JoinColumn({ name: 'transaction_group_id' })
  transactionGroup!: Relation<TransactionGroup>;

  @Column()
  transactionGroupId!: number;

  @Column({ length: 50 })
  slipNumber!: string;

  @Column()
  category!: Category;

  // 입력구분
  @Column()
  inputType!: InputType;

  @Column()
  status!: SlipStatus;

  // TODO: 추후, User로 대체
  @Column({ length: 50 })
  createWorker!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date | null = null;

  // 작업 보류 여부
  @Column()
  isHold!: boolean;

  @OneToMany(
    () => TransactionItem,
    (transactionItem) => transactionItem.transaction,
    { cascade: true },
  )
  transactionItems!: Relation<TransactionItem>[];

  @OneToOne(
    () => TransactionB2cOrder,
    (transactionB2cOrder) => transactionB2cOrder.transaction,
    { cascade: true },
  )
  transactionB2cOrder!: Relation<TransactionB2cOrder>;

  @OneToMany(
    () => WaveTransaction,
    (waveTransaction) => waveTransaction.transaction,
    { cascade: true },
  )
  waveTransactions!: Relation<WaveTransaction>[];
}
