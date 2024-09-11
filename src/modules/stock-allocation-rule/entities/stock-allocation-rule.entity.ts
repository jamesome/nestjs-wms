import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { StockAllocationMethod, ZoneFilter } from 'src/modules/enum';
import { Shipper } from 'src/modules/shipper/entities/shipper.entity';
import { StockAllocationRuleShop } from 'src/modules/stock-allocation-rule-shop/entities/stock-allocation-rule-shop.entity';
import { StockAllocationRuleZone } from 'src/modules/stock-allocation-rule-zone/entities/stock-allocation-rule-zone.entity';
import { TimestampedEntity } from 'src/modules/timestamped-entity';
import { Warehouse } from 'src/modules/warehouse/entities/warehouse.entity';

@Entity({ name: 'stock_allocation_rule' })
export class StockAllocationRule extends TimestampedEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.stockAllocationRules, {
    // eager: true,
    // cascade: true,
  })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse!: Relation<Warehouse>;

  @Column({ name: 'warehouse_id' })
  warehouseId!: number;

  @ManyToOne(() => Shipper, (shipper) => shipper.stockAllocationRules, {
    // eager: true,
    // cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'shipper_id' })
  shipper!: Relation<Shipper> | null;

  @Column({ name: 'shipper_id', nullable: true })
  shipperId!: number | null;

  @Column({
    name: 'priority',
    nullable: false,
    comment: '우선순위(정렬순서)',
  })
  priority!: number;

  @Column('varchar', {
    name: 'name',
    length: 50,
    nullable: false,
    comment: '룰 옵션명',
  })
  name!: string;

  @Column({
    type: 'enum',
    enum: StockAllocationMethod,
    name: 'method',
    nullable: false,
    comment: '재고할당 룰. fefo(선 만료 선출법), lpr(공간 최적화 할당)',
  })
  method!: StockAllocationMethod | string;

  @Column({
    type: 'enum',
    enum: ZoneFilter,
    name: 'zone_filter',
    nullable: false,
    comment: '존 포함 제외. include (포함), exclude(제외)',
  })
  zoneFilter!: ZoneFilter | string;

  @Column('tinyint', {
    name: 'is_default',
    nullable: false,
    comment: '기본 창고 여부',
  })
  isDefault!: number;

  @OneToMany(
    () => StockAllocationRuleShop,
    (stockAllocationRuleShop) => stockAllocationRuleShop.stockAllocationRule,
  )
  stockAllocationRuleShops!: Relation<StockAllocationRuleShop>[];

  @OneToMany(
    () => StockAllocationRuleZone,
    (stockAllocationRuleZone) => stockAllocationRuleZone.stockAllocationRule,
  )
  stockAllocationRuleZones!: Relation<StockAllocationRuleZone>[];
}
