import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { TransactionItem } from 'src/modules/transaction-item/entities/transaction-item.entity';
import { Item } from 'src/modules/item/entities/item.entity';
import { Location } from 'src/modules/location/entities/location.entity';
import { Lot } from 'src/modules/lot/entities/lot.entity';

@Entity()
export class StockAllocated {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(
    () => TransactionItem,
    (transactionItem) => transactionItem.stockAllocations,
    { cascade: true },
  )
  @JoinColumn({ name: 'transaction_item_id' })
  transactionItem!: Relation<TransactionItem>;

  @Column({ name: 'transaction_item_id' })
  transactionItemId!: number;

  @ManyToOne(() => Item, (item) => item.stockAllocations)
  @JoinColumn({ name: 'item_id' })
  item!: Relation<Item>;

  // (FK) 품목 일련번호
  @Column()
  itemId!: number;

  @ManyToOne(() => Location, (location) => location.stockAllocations)
  @JoinColumn({ name: 'location_id' })
  location!: Relation<Location>;

  @Column({ name: 'location_id' })
  locationId!: number;

  @ManyToOne(() => Lot, (lot) => lot.stockAllocations)
  @JoinColumn({ name: 'lot_id' })
  lot!: Relation<Lot>;

  // (FK) Lot 일련번호
  @Column({ type: 'int', nullable: true })
  lotId?: number | null;

  @Column()
  allocatedQuantity!: number;

  // 피킹 된 수량
  @Column()
  pickedQuantity?: number;

  @CreateDateColumn({
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
}
