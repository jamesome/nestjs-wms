import { StockAllocationRule } from 'src/modules/stock-allocation-rule/entities/stock-allocation-rule.entity';
import { Shop } from 'src/modules/shop/entities/shop.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';

@Entity({ name: 'stock_allocation_rule_shop' })
export class StockAllocationRuleShop {
  @ManyToOne(
    () => StockAllocationRule,
    (stockAllocationRule) => stockAllocationRule.stockAllocationRuleShops,
  )
  @JoinColumn({ name: 'stock_allocation_rule_id' })
  stockAllocationRule?: Relation<StockAllocationRule>;

  @PrimaryColumn({ name: 'stock_allocation_rule_id' })
  stockAllocationRuleId!: number;

  @ManyToOne(() => Shop, (shop) => shop.stockAllocationRuleShops)
  @JoinColumn({ name: 'shop_id' })
  shop?: Relation<Shop>;

  @PrimaryColumn({ name: 'shop_id' })
  shopId!: number;
}
