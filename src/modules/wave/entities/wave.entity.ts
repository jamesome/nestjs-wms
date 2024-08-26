import { Expose } from 'class-transformer';
import { VirtualColumn } from 'src/common/decorators/virtual-column.decorator';
import { WaveStatus } from 'src/modules/enum';
import { TimestampedEntity } from 'src/modules/timestamped-entity';
import { WaveTransaction } from 'src/modules/wave-transaction/entities/wave-transaction.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity({ name: 'wave' })
export class Wave extends TimestampedEntity {
  @Expose()
  @PrimaryGeneratedColumn()
  id!: number;

  @Expose()
  @Column('int', {
    name: 'sequence',
    nullable: false,
    comment: '차수',
  })
  sequence!: number;

  @Expose()
  @Column('varchar', {
    name: 'name',
    length: 50,
    // unique: true,
    nullable: false,
    comment: '웨이브명',
  })
  name!: string;

  @Expose({ name: 'status' })
  @Column({
    type: 'enum',
    enum: WaveStatus,
    name: 'status',
    nullable: false,
    comment: '웨이브 상태. new(신규), in_progress(작업진행중), canceled(취소)',
  })
  status!: WaveStatus;

  // TODO: 추후, User로 대체
  @Expose({ name: 'create_worker' })
  @Column('varchar', {
    name: 'create_worker',
    length: 50,
    comment: '창고 등록 작업자',
  })
  createWorker?: string;

  @Expose({ name: 'wave_transactions' })
  @OneToMany(() => WaveTransaction, (waveTransaction) => waveTransaction.wave)
  waveTransactions!: Relation<WaveTransaction>[];

  @Expose({ name: 'count_by_status' })
  @VirtualColumn({ type: 'object' })
  countByStatus?: object;
}
