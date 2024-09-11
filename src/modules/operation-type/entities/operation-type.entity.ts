import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { Category } from 'src/modules/enum';
import { TransactionItem } from 'src/modules/transaction-item/entities/transaction-item.entity';

@Entity({ name: 'operation_type' })
@Index(['category', 'name'], { unique: true }) // 유니크 => [카테고리 + 재고작업구분명]
export class OperationType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: Category,
    name: 'category',
    nullable: false,
    comment: '구분. incoming(입고), outgoing(출고), movement(이동)',
  })
  category!: Category;

  @Column('varchar', {
    name: 'name',
    length: 50,
    unique: true,
    nullable: false,
    comment: '재고작업구분명',
  })
  name!: string;

  @Column('tinyint', {
    name: 'is_default',
    nullable: false,
    default: 0,
    comment: '기본 노출로 선택된 값',
  })
  isDefault!: number;

  @Column('tinyint', {
    name: 'reserved',
    nullable: false,
    comment: '예약값. 미리 정의 된 재고작업구분들.',
  })
  reserved!: number;

  @OneToMany(
    () => TransactionItem,
    (transactionItem) => transactionItem.operationType,
  )
  transactions!: Relation<TransactionItem>[];
}
