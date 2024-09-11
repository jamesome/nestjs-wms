import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  Relation,
  OneToMany,
} from 'typeorm';
import { TimestampedEntity } from 'src/modules/timestamped-entity';
import { Zone } from 'src/modules/zone/entities/zone.entity';
import { InventoryItem } from 'src/modules/inventory-item/entities/inventory-item.entity';
import { TransactionItem } from 'src/modules/transaction-item/entities/transaction-item.entity';
import { VirtualColumn } from 'src/common/decorators/virtual-column.decorator';
import { StockAllocated } from 'src/modules/stock-allocated/entities/stock-allocated.entity';

@Entity({ name: 'location' })
export class Location extends TimestampedEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Zone, (zone) => zone.locations)
  @JoinColumn({ name: 'zone_id' })
  zone!: Relation<Zone>;

  @Column({ name: 'zone_id' })
  zoneId!: number;

  @Column('varchar', {
    name: 'name',
    length: 100,
    unique: true,
    nullable: false,
    comment: '로케이션명',
  })
  name!: string;

  @Column('text', {
    name: 'remark',
    nullable: true,
    comment: '비고',
  })
  remark?: string;

  // TODO: 추후, User로 대체
  @Column('varchar', {
    name: 'create_worker',
    length: 50,
    comment: '창고 등록 작업자',
  })
  createWorker?: string;

  @Column('tinyint', {
    name: 'is_default',
    nullable: true,
    comment: '기본 창고 여부',
  })
  isDefault!: number;

  @OneToMany(() => InventoryItem, (inventoryItem) => inventoryItem.location)
  inventoryItems!: Relation<InventoryItem>[];

  @OneToMany(
    () => TransactionItem,
    (transactionItem) => transactionItem.locationDeparture,
  )
  transactions_locationDeparture!: Relation<TransactionItem>[];

  @OneToMany(
    () => TransactionItem,
    (transactionItem) => transactionItem.locationArrival,
  )
  transactions_locationArrival!: Relation<TransactionItem>[];

  // Virtual Entities
  @VirtualColumn({ type: 'number' })
  quantity!: number;

  @OneToMany(
    () => StockAllocated,
    (stockAllStockAllocated) => stockAllStockAllocated.location,
  )
  stockAllocations!: Relation<StockAllocated>[];
}
