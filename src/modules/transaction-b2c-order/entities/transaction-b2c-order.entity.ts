import { Transaction } from 'src/modules/transaction/entities/transaction.entity';
import { Shop } from 'src/modules/shop/entities/shop.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('transaction_b2c_order')
export class TransactionB2cOrder {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Transaction, (transaction) => transaction.transactionB2cOrder)
  @JoinColumn({ name: 'transaction_id' })
  transaction!: Relation<Transaction>;

  @Column({
    name: 'transaction_id',
    nullable: false,
    comment: '(FK) 트랜잭션 일련번호',
  })
  transactionId!: number;

  @Column('varchar', {
    name: 'number',
    length: 200,
    comment: '판매처 주문번호',
  })
  number?: string;

  @ManyToOne(() => Shop, (shop) => shop.transactionB2cOrders)
  @JoinColumn({ name: 'shop_id' })
  shop!: Relation<Shop>;

  @Column({
    name: 'shop_id',
    comment: '(FK) 판매처 일련번호',
  })
  shopId!: number;

  @Column('varchar', {
    name: 'recipient',
    length: 100,
    comment: '수령자명',
  })
  recipient?: string;

  @Column('varchar', {
    name: 'contact',
    length: 20,
    comment: '연락처 HP ?? TEL',
  })
  contact?: string;

  @Column('varchar', {
    name: 'post_code',
    length: 6,
    comment: '우편번호',
  })
  postCode?: string;

  @Column('varchar', {
    name: 'address',
    length: 500,
    comment: '주소',
  })
  address?: string;

  @Column('varchar', {
    name: 'detail_address',
    length: 500,
    comment: '상세주소',
  })
  detailAddress?: string;

  @Column('varchar', {
    name: 'invoice_number',
    length: 30,
    comment: '송장번호',
  })
  invoiceNumber?: string;

  @Column({
    type: 'date',
    name: 'ordered_at',
    comment: '주문일자',
  })
  orderedAt?: Date;
}
