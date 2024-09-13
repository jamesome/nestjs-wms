import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { InventoryItem } from 'src/modules/inventory-item/entities/inventory-item.entity';
import { Item } from 'src/modules/item/entities/item.entity';
import { Supplier } from 'src/modules/supplier/entities/supplier.entity';
import { TransactionItem } from 'src/modules/transaction-item/entities/transaction-item.entity';
import { StockAllocated } from 'src/modules/stock-allocated/entities/stock-allocated.entity';

@Entity()
export class Lot {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Item, (item) => item.lots)
  @JoinColumn({ name: 'item_id' })
  item!: Relation<Item>;

  @Column()
  itemId!: number;

  @ManyToOne(() => Supplier, (supplier) => supplier.lots, {
    eager: true,
    cascade: true,
  })
  @JoinColumn({ name: 'supplier_id' })
  supplier!: Relation<Supplier>;

  // (FK) 공급처 일련번호
  @Column()
  supplierId!: number;

  // 로트번호
  @Column({ length: 50 })
  number!: string;

  // 유통기한
  @Column({ type: 'date', nullable: true })
  expirationDate?: Date | null = null;

  @OneToMany(() => InventoryItem, (inventoryItem) => inventoryItem.lot)
  inventoryItems!: Relation<InventoryItem>[];

  @OneToMany(() => TransactionItem, (transactionItem) => transactionItem.lot)
  transactions!: Relation<TransactionItem>[];

  @OneToMany(() => StockAllocated, (stockAllocated) => stockAllocated.lot)
  stockAllocations!: Relation<StockAllocated>[];
}
