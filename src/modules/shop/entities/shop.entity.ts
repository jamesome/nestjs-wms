import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { StockAllocationRuleShop } from 'src/modules/stock-allocation-rule-shop/entities/stock-allocation-rule-shop.entity';
import { TransactionB2cOrder } from 'src/modules/transaction-b2c-order/entities/transaction-b2c-order.entity';

@Entity()
export class Shop {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50 })
  name!: string;

  @OneToMany(
    () => TransactionB2cOrder,
    (transactionB2cOrder) => transactionB2cOrder.shop,
  )
  transactionB2cOrders!: Relation<TransactionB2cOrder>[];

  @OneToMany(
    () => StockAllocationRuleShop,
    (stockAllocationRuleShop) => stockAllocationRuleShop.shop,
  )
  stockAllocationRuleShops!: Relation<StockAllocationRuleShop>[];
}
