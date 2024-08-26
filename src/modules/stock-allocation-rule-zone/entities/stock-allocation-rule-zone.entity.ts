import { Expose } from 'class-transformer';
import { StockAllocationRule } from 'src/modules/stock-allocation-rule/entities/stock-allocation-rule.entity';
import { Zone } from 'src/modules/zone/entities/zone.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';

@Entity({ name: 'stock_allocation_rule_zone' })
export class StockAllocationRuleZone {
  @Expose()
  @ManyToOne(
    () => StockAllocationRule,
    (stockAllocationRule) => stockAllocationRule.stockAllocationRuleShops,
  )
  @JoinColumn({ name: 'stock_allocation_rule_id' })
  stockAllocationRule!: Relation<StockAllocationRule>;

  @Expose({ name: 'stock_allocation_rule_id' })
  @PrimaryColumn({ name: 'stock_allocation_rule_id' })
  stockAllocationRuleId!: number;

  @Expose()
  @ManyToOne(() => Zone, (zone) => zone.stockAllocationRuleZones)
  @JoinColumn({ name: 'zone_id' })
  zone!: Relation<Zone>;

  @Expose({ name: 'zone_id' })
  @PrimaryColumn({ name: 'zone_id' })
  zoneId!: number;
}
