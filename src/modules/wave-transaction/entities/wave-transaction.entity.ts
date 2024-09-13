import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';
import { Transaction } from 'src/modules/transaction/entities/transaction.entity';
import { Wave } from 'src/modules/wave/entities/wave.entity';

@Entity()
export class WaveTransaction {
  @ManyToOne(() => Wave, (wave) => wave.waveTransactions)
  @JoinColumn({ name: 'wave_id' })
  wave!: Relation<Wave>;

  @PrimaryColumn()
  waveId!: number;

  @ManyToOne(() => Transaction, (transaction) => transaction.waveTransactions)
  @JoinColumn({ name: 'transaction_id' })
  transaction!: Relation<Transaction>;

  @PrimaryColumn()
  transactionId!: number;
}
