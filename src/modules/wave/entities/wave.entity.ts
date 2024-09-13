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

@Entity()
export class Wave extends TimestampedEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  sequence!: number;

  @Column({ length: 50 })
  name!: string;

  @Column({
    type: 'enum',
    enum: WaveStatus,
    name: 'status',
    nullable: false,
    comment: '웨이브 상태. new(신규), in_progress(작업진행중), canceled(취소)',
  })
  status!: WaveStatus;

  // 창고 등록 작업자
  // TODO: 추후, User로 대체
  @Column({ length: 50 })
  createWorker?: string;

  @OneToMany(() => WaveTransaction, (waveTransaction) => waveTransaction.wave)
  waveTransactions!: Relation<WaveTransaction>[];

  @VirtualColumn({ type: 'object' })
  countByStatus?: object;
}
