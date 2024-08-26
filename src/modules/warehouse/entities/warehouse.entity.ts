import { Expose } from 'class-transformer';
import { StockAllocationRule } from 'src/modules/stock-allocation-rule/entities/stock-allocation-rule.entity';
import { TimestampedEntity } from 'src/modules/timestamped-entity';
import { Zone } from 'src/modules/zone/entities/zone.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity({ name: 'warehouse' })
export class Warehouse extends TimestampedEntity {
  @Expose()
  @PrimaryGeneratedColumn()
  id!: number;

  @Expose()
  @Column('varchar', {
    name: 'name',
    length: 100,
    unique: true,
    nullable: false,
    comment: '창고명',
  })
  name!: string;

  @Expose()
  @Column('varchar', {
    name: 'code',
    length: 100,
    unique: true,
    nullable: false,
    comment: '창고코드',
  })
  code?: string | null;

  @Expose({ name: 'post_code' })
  @Column('varchar', {
    name: 'post_code',
    length: 10,
    nullable: true,
    comment: '우편번호',
  })
  postCode?: string;

  @Expose()
  @Column('varchar', {
    name: 'address',
    length: 500,
    nullable: true,
    comment: '주소',
  })
  address?: string;

  @Expose({ name: 'detail_address' })
  @Column('varchar', {
    name: 'detail_address',
    length: 500,
    nullable: true,
    comment: '상세주소',
  })
  detailAddress?: string;

  @Expose()
  @Column('varchar', {
    name: 'manager',
    length: 100,
    nullable: true,
    comment: '담당자',
  })
  manager?: string;

  @Expose()
  @Column('varchar', {
    name: 'contact',
    length: 20,
    nullable: true,
    comment: '연락처',
  })
  contact?: string;

  // TODO: 추후, User로 대체
  @Expose({ name: 'create_worker' })
  @Column('varchar', {
    name: 'create_worker',
    length: 50,
    comment: '창고 등록 작업자',
  })
  createWorker?: string;

  @Expose({ name: 'is_default' })
  @Column('tinyint', {
    name: 'is_default',
    nullable: true,
    comment: '기본 창고 여부',
  })
  isDefault!: number;

  @Expose()
  @OneToMany(() => Zone, (zone) => zone.warehouse, {
    cascade: true,
  })
  zones?: Relation<Zone>[];

  @Expose()
  @OneToMany(
    () => StockAllocationRule,
    (stockAllocationRule) => stockAllocationRule.warehouse,
    {
      // cascade: true,
    },
  )
  stockAllocationRules?: Relation<StockAllocationRule>[];
}
