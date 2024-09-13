import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
} from 'typeorm';
import { Item } from 'src/modules/item/entities/item.entity';

@Entity()
@Unique(['code'])
export class ItemCode {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Item, (item) => item.itemCodes)
  @JoinColumn({ name: 'item_id' })
  item!: Relation<Item>;

  @Column()
  itemId!: number;

  // 바코드1 ~ 3, 글로벌 바코드
  @Column({
    length: 50,
    unique: true,
  })
  code!: string;
}
