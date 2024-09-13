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

@Entity()
@Index(['category', 'name'], { unique: true }) // 유니크 => [카테고리 + 재고작업구분명]
export class OperationType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  category!: Category;

  @Column({ length: 50 })
  name!: string;

  // 기본 노출 여부
  @Column()
  isDefault!: boolean;

  // 예약값. 미리 정의 된 재고작업구분들.
  @Column()
  reserved!: boolean;

  @OneToMany(
    () => TransactionItem,
    (transactionItem) => transactionItem.operationType,
  )
  transactions!: Relation<TransactionItem>[];
}
