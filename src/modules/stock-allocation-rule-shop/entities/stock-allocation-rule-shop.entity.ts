import { Expose } from 'class-transformer';
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
  @Expose()
  @ManyToOne(
    () => StockAllocationRule,
    (stockAllocationRule) => stockAllocationRule.stockAllocationRuleShops,
  )
  @JoinColumn({ name: 'stock_allocation_rule_id' })
  stockAllocationRule?: Relation<StockAllocationRule>;

  @Expose({ name: 'stock_allocation_rule_id' })
  @PrimaryColumn({ name: 'stock_allocation_rule_id' })
  stockAllocationRuleId!: number;

  @Expose()
  @ManyToOne(() => Shop, (shop) => shop.stockAllocationRuleShops)
  @JoinColumn({ name: 'shop_id' })
  shop?: Relation<Shop>;

  @Expose({ name: 'shop_id' })
  @PrimaryColumn({ name: 'shop_id' })
  shopId!: number;
}
