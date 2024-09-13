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

@Entity()
export class InventoryItem {
  @ManyToOne(() => Item, (item) => item.inventoryItems)
  @JoinColumn({ name: 'item_id' })
  item!: Relation<Item>;

  @PrimaryColumn()
  itemId!: number;

  @ManyToOne(() => Location, (location) => location.inventoryItems)
  @JoinColumn({ name: 'location_id' })
  location!: Relation<Location>;

  @PrimaryColumn()
  locationId!: number;

  // 재고수량
  @Column()
  quantity!: number;

  // 재고상태
  @Column({ default: StockStatus.NORMAL })
  status!: StockStatus;

  @ManyToOne(() => Lot, (lot) => lot.inventoryItems, { eager: true })
  @JoinColumn({ name: 'lot_id' })
  lot!: Relation<Lot>;

  // (FK) Lot 일련번호
  @Column({ type: 'int', nullable: true })
  lotId?: number | null;
}
