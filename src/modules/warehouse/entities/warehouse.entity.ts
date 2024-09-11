import { StockAllocationRule } from 'src/modules/stock-allocation-rule/entities/stock-allocation-rule.entity';
import { TimestampedEntity } from 'src/modules/timestamped-entity';
import { Zone } from 'src/modules/zone/entities/zone.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
} from 'typeorm';

@Entity({ name: 'warehouse' })
@Unique(['name', 'code'])
export class Warehouse extends TimestampedEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', {
    name: 'name',
    length: 100,
    unique: true,
    nullable: false,
    comment: '창고명',
  })
  name!: string;

  @Column('varchar', {
    name: 'code',
    length: 100,
    unique: true,
    nullable: true,
    comment: '창고코드',
  })
  code?: string | null;

  @Column('varchar', {
    name: 'post_code',
    length: 10,
    nullable: true,
    comment: '우편번호',
  })
  postCode?: string;

  @Column('varchar', {
    name: 'address',
    length: 500,
    nullable: true,
    comment: '주소',
  })
  address?: string;

  @Column('varchar', {
    name: 'detail_address',
    length: 500,
    nullable: true,
    comment: '상세주소',
  })
  detailAddress?: string;

  @Column('varchar', {
    name: 'manager',
    length: 100,
    nullable: true,
    comment: '담당자',
  })
  manager?: string;

  @Column('varchar', {
    name: 'contact',
    length: 20,
    nullable: true,
    comment: '연락처',
  })
  contact?: string;

  // TODO: 추후, User로 대체
  @Column('varchar', {
    name: 'create_worker',
    length: 50,
    comment: '창고 등록 작업자',
  })
  createWorker?: string;

  @Column('tinyint', {
    name: 'is_default',
    nullable: true,
    comment: '기본 창고 여부',
  })
  isDefault!: number;

  @OneToMany(() => Zone, (zone) => zone.warehouse, {
    cascade: true,
  })
  zones?: Relation<Zone>[];

  @OneToMany(
    () => StockAllocationRule,
    (stockAllocationRule) => stockAllocationRule.warehouse,
    {
      // cascade: true,
    },
  )
  stockAllocationRules?: Relation<StockAllocationRule>[];
}
