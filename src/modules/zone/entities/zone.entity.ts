import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
} from 'typeorm';
import { TimestampedEntity } from 'src/modules/timestamped-entity';
import { Warehouse } from 'src/modules/warehouse/entities/warehouse.entity';
import { Location } from 'src/modules/location/entities/location.entity';
import { StockAllocationRuleZone } from 'src/modules/stock-allocation-rule-zone/entities/stock-allocation-rule-zone.entity';

@Entity()
@Unique(['name', 'code'])
export class Zone extends TimestampedEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.zones)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse!: Relation<Warehouse>;

  @Column()
  warehouseId!: number;

  @Column({ length: 100, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  code?: string | null;

  @OneToMany(() => Location, (location) => location.zone, {
    cascade: true,
  })
  locations?: Relation<Location>[];

  @OneToMany(
    () => StockAllocationRuleZone,
    (stockAllocationRuleZone) => stockAllocationRuleZone.zone,
  )
  stockAllocationRuleZones!: Relation<StockAllocationRuleZone>[];
}
