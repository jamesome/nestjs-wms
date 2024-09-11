import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';
import { TransactionItem } from 'src/modules/transaction-item/entities/transaction-item.entity';
import { Item } from 'src/modules/item/entities/item.entity';
import { Location } from 'src/modules/location/entities/location.entity';
import { Lot } from 'src/modules/lot/entities/lot.entity';

@Entity({ name: 'stock_allocated' })
export class StockAllocated {
  @ManyToOne(
    () => TransactionItem,
    (transactionItem) => transactionItem.stockAllocations,
  )
  @JoinColumn({ name: 'transaction_item_id' })
  transactionItem!: Relation<TransactionItem>;

  @PrimaryColumn({ name: 'transaction_item_id' })
  transactionItemId!: number;

  @ManyToOne(() => Item, (item) => item.stockAllocations)
  @JoinColumn({ name: 'item_id' })
  item!: Relation<Item>;

  @Column({
    name: 'item_id',
    nullable: false,
    comment: '(FK) 품목 일련번호',
  })
  itemId!: number;

  @ManyToOne(
    () => Location,
    (locationLocation) => locationLocation.stockAllocations,
  )
  @JoinColumn({ name: 'location_id' })
  location!: Relation<Location>;

  @PrimaryColumn({ name: 'location_id' })
  locationId!: number;

  @ManyToOne(() => Lot, (lot) => lot.stockAllocations)
  @JoinColumn({ name: 'lot_id' })
  lot!: Relation<Lot>;

  @Column('int', {
    name: 'lot_id',
    comment: '(FK) Lot 일련번호',
  })
  lotId?: number | null;

  @Column('int', {
    name: 'quantity',
    nullable: false,
    comment: '재고',
  })
  quantity!: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
}
