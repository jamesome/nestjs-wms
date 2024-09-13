import { Item } from 'src/modules/item/entities/item.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['serialNo'])
export class ItemSerial {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Item, (item) => item.itemSerials)
  @JoinColumn({ name: 'item_id' })
  item!: Relation<Item>;

  @Column()
  itemId!: number;

  @Column({
    length: 50,
    unique: true,
  })
  serialNo?: string;
}
