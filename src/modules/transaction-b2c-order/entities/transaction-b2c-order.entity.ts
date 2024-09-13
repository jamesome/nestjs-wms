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

@Entity()
export class TransactionB2cOrder {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Transaction, (transaction) => transaction.transactionB2cOrder)
  @JoinColumn({ name: 'transaction_id' })
  transaction!: Relation<Transaction>;

  @Column()
  transactionId!: number;

  // 판매처 주문번호
  @Column({ length: 200 })
  number?: string;

  @ManyToOne(() => Shop, (shop) => shop.transactionB2cOrders)
  @JoinColumn({ name: 'shop_id' })
  shop!: Relation<Shop>;

  @Column()
  shopId!: number;

  @Column({ length: 100 })
  recipient?: string;

  @Column({ length: 20 })
  contact?: string;

  @Column({ length: 6 })
  postCode?: string;

  @Column({ length: 500 })
  address?: string;

  @Column({ length: 500 })
  detailAddress?: string;

  @Column({ length: 30 })
  invoiceNumber?: string;

  @Column()
  orderedAt?: Date;
}
