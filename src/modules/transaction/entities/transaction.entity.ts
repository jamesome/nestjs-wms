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
import { BooleanTransformer } from 'src/common/transformers/BooleanTransformer';

@Entity('transaction')
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(
    () => TransactionGroup,
    (transactionGroup) => transactionGroup.transactions,
  )
  @JoinColumn({ name: 'transaction_group_id' })
  transactionGroup!: Relation<TransactionGroup>;

  @Column({
    name: 'transaction_group_id',
    nullable: false,
    comment: '(FK) 품목 일련번호',
  })
  transactionGroupId!: number;

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

  @Column({
    type: 'enum',
    enum: InputType,
    name: 'input_type',
    nullable: false,
    comment: '입고 유형. receiving(개별입고)...',
  })
  inputType!: InputType;

  @Column({
    type: 'enum',
    enum: SlipStatus,
    name: 'status',
    nullable: false,
    comment:
      '전표상태. scheduled(작업예정), received(입하완료), inspected(검품완료), partial_receiving(부분입고진행), partial_in_stock(부분입고완료), returned(반품완료), in_stock(입고완료), in_transit(이동중), transferred(이동완료), allocated(출고지시완료(할당완료)), picking(피킹작업중), picking_hold(피킹보류), picking_failure(피킹실패), picked(피킹완료), packed(패킹완료), shipped(출고완료), canceled(취소완료)',
  })
  status!: SlipStatus | SlipStatus[];

  // TODO: 추후, User로 대체
  @Column('varchar', {
    name: 'create_worker',
    length: 50,
    comment: '창고 등록 작업자',
  })
  createWorker!: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date | null = null;

  @Column({
    type: 'timestamp',
    name: 'completed_at',
    nullable: true,
    comment: '(입고, 출고, 이동) 완료일자',
  })
  completedAt?: Date | null = null;

  @Column('tinyint', {
    name: 'is_hold',
    width: 1,
    nullable: false,
    default: false,
    comment: '기본 창고 여부',
    transformer: new BooleanTransformer(),
  })
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
