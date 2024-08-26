import { Expose } from 'class-transformer';
import { Item } from 'src/modules/item/entities/item.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity({ name: 'item_code' })
export class ItemCode {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Item, (item) => item.itemCodes)
  @JoinColumn({ name: 'item_id' })
  item!: Relation<Item>;

  @Column({ name: 'item_id' })
  @Expose({ name: 'item_id' })
  itemId!: number;

  @Column('varchar', {
    name: 'code',
    length: 50,
    unique: true,
    nullable: false,
    comment: '바코드1 ~ 3, 글로벌 바코드',
  })
  code!: string;
}
