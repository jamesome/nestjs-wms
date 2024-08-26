import { Item } from 'src/modules/item/entities/item.entity';
import { StockAllocationRule } from 'src/modules/stock-allocation-rule/entities/stock-allocation-rule.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity({ name: 'shipper' })
export class Shipper {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', {
    name: 'name',
    length: 50,
    nullable: false,
    comment: '화주명',
  })
  name!: string;

  @OneToMany(() => Item, (item) => item.shipper)
  items!: Relation<Item>[];

  @OneToMany(
    () => StockAllocationRule,
    (stockAllocationRule) => stockAllocationRule.shipper,
  )
  stockAllocationRules!: Relation<StockAllocationRule>[];
}
