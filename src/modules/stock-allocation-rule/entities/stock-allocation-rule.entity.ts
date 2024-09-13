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

@Entity()
export class StockAllocationRule extends TimestampedEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.stockAllocationRules, {
    // eager: true,
    // cascade: true,
  })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse!: Relation<Warehouse>;

  @Column()
  warehouseId!: number;

  @ManyToOne(() => Shipper, (shipper) => shipper.stockAllocationRules, {
    // eager: true,
    // cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'shipper_id' })
  shipper!: Relation<Shipper> | null;

  @Column({ type: 'int', nullable: true })
  shipperId!: number | null;

  // 우선순위(정렬순서)
  @Column()
  priority!: number;

  @Column({ length: 50 })
  name!: string;

  // 재고할당전략
  @Column()
  method!: StockAllocationMethod | string;

  // 존 포함 또는 제외 판단
  @Column()
  zoneFilter!: ZoneFilter | string;

  // 기본 창고 여부
  @Column()
  isDefault!: boolean;

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
