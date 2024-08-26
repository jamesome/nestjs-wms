import { Expose } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';
import { StockStatus } from 'src/modules/enum';
import { Item } from 'src/modules/item/entities/item.entity';
import { Location } from 'src/modules/location/entities/location.entity';
import { Lot } from 'src/modules/lot/entities/lot.entity';

@Entity({ name: 'inventory_item' })
export class InventoryItem {
  @ManyToOne(() => Item, (item) => item.inventoryItems)
  @JoinColumn({ name: 'item_id' })
  item!: Relation<Item>;

  @Expose({ name: 'item_id' })
  @PrimaryColumn({ name: 'item_id' })
  itemId!: number;

  @ManyToOne(() => Location, (location) => location.inventoryItems)
  @JoinColumn({ name: 'location_id' })
  location!: Relation<Location>;

  @Expose({ name: 'location_id' })
  @PrimaryColumn({ name: 'location_id' })
  locationId!: number;

  @Column('int', {
    name: 'quantity',
    nullable: false,
    comment: '재고',
  })
  quantity!: number;

  @Column({
    type: 'enum',
    enum: StockStatus,
    name: 'status',
    nullable: false,
    default: StockStatus.NORMAL,
    comment: '재고상태. normal => 정상, abnormal => 비정상, disposed => 폐기',
  })
  status!: StockStatus;

  @ManyToOne(() => Lot, (lot) => lot.inventoryItems, { eager: true })
  @JoinColumn({ name: 'lot_id' })
  lot!: Relation<Lot>;

  @Expose({ name: 'lot_id' })
  @Column('int', {
    name: 'lot_id',
    comment: '(FK) Lot 일련번호',
  })
  lotId?: number | null;
}
