import { Item } from 'src/modules/item/entities/item.entity';
import { StockAllocationRule } from 'src/modules/stock-allocation-rule/entities/stock-allocation-rule.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity()
export class Shipper {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50 })
  name!: string;

  @OneToMany(() => Item, (item) => item.shipper)
  items!: Relation<Item>[];

  @OneToMany(
    () => StockAllocationRule,
    (stockAllocationRule) => stockAllocationRule.shipper,
  )
  stockAllocationRules!: Relation<StockAllocationRule>[];
}
