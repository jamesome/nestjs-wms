import { Expose } from 'class-transformer';
import { StockAllocationRuleShop } from 'src/modules/stock-allocation-rule-shop/entities/stock-allocation-rule-shop.entity';
import { TransactionB2cOrder } from 'src/modules/transaction-b2c-order/entities/transaction-b2c-order.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity({ name: 'shop' })
export class Shop {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', {
    name: 'name',
    length: 50,
    nullable: false,
    comment: '판매처명',
  })
  name!: string;

  @Expose({ name: 'stock_allocation_rule_shops' })
  @OneToMany(
    () => TransactionB2cOrder,
    (transactionB2cOrder) => transactionB2cOrder.shop,
  )
  transactionB2cOrders!: Relation<TransactionB2cOrder>[];

  @Expose({ name: 'stock_allocation_rule_shops' })
  @OneToMany(
    () => StockAllocationRuleShop,
    (stockAllocationRuleShop) => stockAllocationRuleShop.shop,
  )
  stockAllocationRuleShops!: Relation<StockAllocationRuleShop>[];
}
