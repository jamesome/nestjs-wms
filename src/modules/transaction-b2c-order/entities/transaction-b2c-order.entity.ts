import { Expose } from 'class-transformer';
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

  @Expose()
  @OneToOne(() => Transaction, (transaction) => transaction.transactionB2cOrder)
  @JoinColumn({ name: 'transaction_id' })
  transaction?: Relation<Transaction>[];

  @Expose({ name: 'transaction_id' })
  @Column({
    name: 'transaction_id',
    nullable: false,
    comment: '(FK) 트랜잭션 일련번호',
  })
  transactionId!: number;

  @Expose({ name: 'number' })
  @Column('varchar', {
    name: 'number',
    length: 200,
    comment: '판매처 주문번호',
  })
  number?: string;

  @Expose()
  @ManyToOne(() => Shop, (shop) => shop.transactionB2cOrders)
  @JoinColumn({ name: 'shop_id' })
  shop?: Relation<Shop>[];

  @Expose({ name: 'shop_id' })
  @Column({
    name: 'shop_id',
    comment: '(FK) 판매처 일련번호',
  })
  shopId?: number;

  @Expose({ name: 'recipient' })
  @Column('varchar', {
    name: 'recipient',
    length: 100,
    comment: '수령자명',
  })
  recipient?: string;

  @Expose({ name: 'contact' })
  @Column('varchar', {
    name: 'contact',
    length: 20,
    comment: '연락처 HP ?? TEL',
  })
  contact?: string;

  @Expose({ name: 'post_code' })
  @Column('varchar', {
    name: 'post_code',
    length: 6,
    comment: '우편번호',
  })
  postCode?: string;

  @Expose({ name: 'address' })
  @Column('varchar', {
    name: 'address',
    length: 500,
    comment: '주소',
  })
  address?: string;

  @Expose({ name: 'detail_address' })
  @Column('varchar', {
    name: 'detail_address',
    length: 500,
    comment: '상세주소',
  })
  detailAddress?: string;

  @Expose({ name: 'invoice_number' })
  @Column('varchar', {
    name: 'invoice_number',
    length: 30,
    comment: '송장번호',
  })
  invoiceNumber?: string;

  @Expose({ name: 'ordered_at' })
  @Column({
    type: 'date',
    name: 'ordered_at',
    comment: '주문일자',
  })
  orderedAt?: Date;
}
