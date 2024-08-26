import { Expose } from 'class-transformer';
import { Category, InputType, SlipStatus } from 'src/modules/enum';
import { TransactionB2cOrder } from 'src/modules/transaction-b2c-order/entities/transaction-b2c-order.entity';
import { TransactionGroup } from 'src/modules/transaction-group/entities/transaction-group.entity';
import { TransactionItem } from 'src/modules/transaction-item/entities/transaction-item.entity';
import { TransactionZone } from 'src/modules/transaction-zone/entities/transaction-zone.entity';
import { WaveTransaction } from 'src/modules/wave-transaction/entities/wave-transaction.entity';
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

@Entity('transaction')
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Expose({ name: 'transaction_group' })
  @ManyToOne(
    () => TransactionGroup,
    (transactionGroup) => transactionGroup.transactions,
  )
  @JoinColumn({ name: 'transaction_group_id' })
  transactionGroup!: Relation<TransactionGroup>;

  @Expose({ name: 'transaction_group_id' })
  @Column({
    name: 'transaction_group_id',
    nullable: false,
    comment: '(FK) 품목 일련번호',
  })
  transactionGroupId!: number;

  @Expose({ name: 'slip_number' })
  @Column('varchar', {
    name: 'slip_number',
    length: 50,
    comment: '전표번호(규칙에 따른 생성)',
  })
  slipNumber!: string;

  @Column({
    type: 'enum',
    enum: Category,
    name: 'category',
    nullable: false,
    comment: '구분. 입고 | 출고 | 이동',
  })
  category!: Category;

  @Expose({ name: 'input_type' })
  @Column({
    type: 'enum',
    enum: InputType,
    name: 'input_type',
    nullable: false,
    comment: '입고 유형. incoming(개별입고)...',
  })
  inputType!: InputType;

  @Column({
    type: 'enum',
    enum: SlipStatus,
    name: 'status',
    nullable: false,
    comment:
      '전표상태(작업예정, 입하완료, 검품완료, 부분입고진행, 부분입고완료, 반품완료, 입고완료, 이동중, 이동완료, 할당완료, 출고작업중, 피킹완료, 패킹완료, 출하완료, 취소완료)',
  })
  status!: SlipStatus | SlipStatus[];

  // TODO: 추후, User로 대체
  @Expose({ name: 'create_worker' })
  @Column('varchar', {
    name: 'create_worker',
    length: 50,
    comment: '창고 등록 작업자',
  })
  createWorker!: string;

  @Expose({ name: 'created_at' })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @Expose({ name: 'updated_at' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date | null = null;

  @Expose({ name: 'completed_at' })
  @Column({
    type: 'timestamp',
    name: 'completed_at',
    nullable: true,
    comment: '(입고, 출고, 이동) 완료일자',
  })
  completedAt?: Date | null = null;

  @Expose({ name: 'transaction_items' })
  @OneToMany(
    () => TransactionItem,
    (transactionItem) => transactionItem.transaction,
  )
  transactionItems!: Relation<TransactionItem>[];

  @Expose({ name: 'transaction_b2c_order' })
  @OneToOne(
    () => TransactionB2cOrder,
    (transactionB2cOrder) => transactionB2cOrder.transaction,
  )
  transactionB2cOrder!: Relation<TransactionB2cOrder>[];

  @Expose({ name: 'transaction_zones' })
  @OneToMany(
    () => TransactionZone,
    (transactionZone) => transactionZone.transaction,
  )
  transactionZones!: Relation<TransactionZone>[];

  @Expose({ name: 'wave_transactions' })
  @OneToMany(
    () => WaveTransaction,
    (waveTransaction) => waveTransaction.transaction,
  )
  waveTransactions!: Relation<WaveTransaction>[];
}
