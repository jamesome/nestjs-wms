import { StringToBigIntTransformer } from 'src/common/transformers/string-to-bigint.transformer';
import { SlipStatus } from 'src/modules/enum';
import { Item } from 'src/modules/item/entities/item.entity';
import { Location } from 'src/modules/location/entities/location.entity';
import { Lot } from 'src/modules/lot/entities/lot.entity';
import { OperationType } from 'src/modules/operation-type/entities/operation-type.entity';
import { StockAllocated } from 'src/modules/stock-allocated/entities/stock-allocated.entity';
import { Supplier } from 'src/modules/supplier/entities/supplier.entity';
import { Transaction } from 'src/modules/transaction/entities/transaction.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity()
export class TransactionItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Transaction, (transaction) => transaction.transactionItems)
  @JoinColumn({ name: 'transaction_id' })
  transaction!: Relation<Transaction>;

  @Column()
  transactionId!: number;

  @ManyToOne(() => Item, (item) => item.transactionItems)
  @JoinColumn({ name: 'item_id' })
  item!: Relation<Item>;

  @Column()
  itemId!: number;

  @ManyToOne(
    () => Location,
    (location) => location.transactions_locationDeparture,
  )
  @JoinColumn({ name: 'location_departure_id' })
  locationDeparture!: Relation<Location>;

  // (FK) 출발 location
  @Column({ type: 'int', nullable: true })
  locationDepartureId?: number | null;

  @ManyToOne(
    () => Location,
    (location) => location.transactions_locationArrival,
  )
  @JoinColumn({ name: 'location_arrival_id' })
  locationArrival!: Relation<Location>;

  // (FK) 도착 location
  @Column({ type: 'int', nullable: true })
  locationArrivalId?: number | null;

  @ManyToOne(() => Lot, (lot) => lot.transactions)
  @JoinColumn({ name: 'lot_id' })
  lot!: Relation<Lot>;

  // (FK) Lot 일련번호
  @Column({ type: 'int', nullable: true })
  lotId?: number | null;

  @ManyToOne(() => Supplier, (supplier) => supplier.transactions)
  @JoinColumn({ name: 'supplier_id' })
  supplier!: Relation<Supplier>;

  @Column({ type: 'int', nullable: true })
  supplierId?: number | null;

  @ManyToOne(() => OperationType, (operationType) => operationType.transactions)
  @JoinColumn({ name: 'operation_type_id' })
  operationType!: Relation<OperationType>;

  // 재고작업구분 일련번호
  @Column({ type: 'int', nullable: true })
  operationTypeId?: number | null;

  // 입고, 이동 된 수량 및 출고지시 된 수량
  @Column()
  orderedQuantity!: number;

  // javascript의 number 타입으로 bigint 표현 시 문자열로 변환되는 경우
  @Column({
    type: 'bigint',
    nullable: true,
    transformer: new StringToBigIntTransformer(),
  })
  price?: number | null;

  @Column()
  status!: SlipStatus;

  @Column()
  remark?: string;

  @Column({ length: 500 })
  imageUrl?: string;

  @OneToMany(
    () => StockAllocated,
    (stockAllocated) => stockAllocated.transactionItem,
  )
  stockAllocations!: Relation<StockAllocated>[];
}
