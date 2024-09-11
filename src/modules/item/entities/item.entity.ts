import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { VirtualColumn } from 'src/common/decorators/virtual-column.decorator';
import { ItemCode } from 'src/modules/item-code/entities/item-code.entity';
import { InventoryItem } from 'src/modules/inventory-item/entities/inventory-item.entity';
import { ItemSerial } from 'src/modules/item-serial/entities/item-serial.entity';
import { Lot } from 'src/modules/lot/entities/lot.entity';
import { TimestampedEntity } from 'src/modules/timestamped-entity';
import { TransactionItem } from 'src/modules/transaction-item/entities/transaction-item.entity';
import { Shipper } from 'src/modules/shipper/entities/shipper.entity';
import { StockAllocated } from 'src/modules/stock-allocated/entities/stock-allocated.entity';

@Entity({ name: 'item' })
export class Item extends TimestampedEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', {
    name: 'name',
    length: 200,
    nullable: false,
    comment: '품목명',
  })
  name!: string;

  @Column('varchar', {
    name: 'property',
    length: 200,
    nullable: false,
    comment: '품목속성 (셀메이트 옵션명)',
  })
  property?: string;

  @OneToMany(() => ItemCode, (itemCode) => itemCode.item, {
    eager: true,
    cascade: true,
  })
  itemCodes!: Relation<ItemCode>[];

  @OneToMany(() => InventoryItem, (inventoryItem) => inventoryItem.item)
  inventoryItems!: Relation<InventoryItem>[];

  @OneToMany(() => StockAllocated, (stockAllocated) => stockAllocated.item)
  stockAllocations!: Relation<StockAllocated>[];

  @OneToMany(() => ItemSerial, (itemSerial) => itemSerial.item, {
    eager: true,
    cascade: true,
  })
  itemSerials!: Relation<ItemSerial>[];

  @OneToMany(() => Lot, (lot) => lot.item)
  lots!: Relation<Lot>[];

  @ManyToOne(() => Shipper, (shipper) => shipper.items, {
    // eager: true,
    // cascade: true,
  })
  @JoinColumn({ name: 'shipper_id' })
  shipper!: Relation<Shipper>;

  @Column({ name: 'shipper_id' })
  shipperId!: number;

  @OneToMany(() => TransactionItem, (transactionItem) => transactionItem.item)
  transactionItems!: Relation<TransactionItem>[];

  // Virtual Entities
  @VirtualColumn({ type: 'number' })
  quantityTotal?: number;

  @VirtualColumn({ type: 'number' })
  quantityAvailable?: number;

  @VirtualColumn({ type: 'number' })
  quantityNonAvailable?: number;

  @VirtualColumn({ type: 'object' })
  quantityByZone?: object;

  @VirtualColumn({ type: 'object' })
  quantityByStatusInZone?: object;
}
