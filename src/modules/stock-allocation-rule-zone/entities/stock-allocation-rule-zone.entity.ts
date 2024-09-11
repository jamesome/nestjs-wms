import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';
import { StockAllocationRule } from 'src/modules/stock-allocation-rule/entities/stock-allocation-rule.entity';
import { Zone } from 'src/modules/zone/entities/zone.entity';

@Entity({ name: 'stock_allocation_rule_zone' })
export class StockAllocationRuleZone {
  @ManyToOne(
    () => StockAllocationRule,
    (stockAllocationRule) => stockAllocationRule.stockAllocationRuleShops,
  )
  @JoinColumn({ name: 'stock_allocation_rule_id' })
  stockAllocationRule!: Relation<StockAllocationRule>;

  @PrimaryColumn({ name: 'stock_allocation_rule_id' })
  stockAllocationRuleId!: number;

  @ManyToOne(() => Zone, (zone) => zone.stockAllocationRuleZones)
  @JoinColumn({ name: 'zone_id' })
  zone!: Relation<Zone>;

  @PrimaryColumn({ name: 'zone_id' })
  zoneId!: number;
}
