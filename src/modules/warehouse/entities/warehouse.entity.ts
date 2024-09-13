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

@Entity()
@Unique(['name', 'code'])
export class Warehouse extends TimestampedEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  code?: string | null;

  @Column({ length: 10 })
  postCode?: string;

  // 주소
  @Column({ length: 500, nullable: true })
  address?: string;

  // 상세주소
  @Column({ length: 500, nullable: true })
  detailAddress?: string;

  // 담당자
  @Column({ length: 100, nullable: true })
  manager?: string;

  // 연락처
  @Column({ length: 20, nullable: true })
  contact?: string;

  // 창고 등록 작업자
  // TODO: 추후, User로 대체
  @Column({ length: 50 })
  createWorker?: string;

  // 기본 창고 여부
  @Column()
  isDefault!: boolean;

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
