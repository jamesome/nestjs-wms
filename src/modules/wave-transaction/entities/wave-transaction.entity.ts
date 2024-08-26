import { Expose } from 'class-transformer';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';
import { Transaction } from 'src/modules/transaction/entities/transaction.entity';
import { Wave } from 'src/modules/wave/entities/wave.entity';

@Entity({ name: 'wave_transaction' })
export class WaveTransaction {
  @ManyToOne(() => Wave, (wave) => wave.waveTransactions)
  @JoinColumn({ name: 'wave_id' })
  wave!: Relation<Wave>;

  @Expose({ name: 'wave_id' })
  @PrimaryColumn({ name: 'wave_id' })
  waveId!: number;

  @ManyToOne(() => Transaction, (transaction) => transaction.waveTransactions)
  @JoinColumn({ name: 'transaction_id' })
  transaction!: Relation<Transaction>;

  @Expose({ name: 'transaction_id' })
  @PrimaryColumn({ name: 'transaction_id' })
  transactionId!: number;
}
