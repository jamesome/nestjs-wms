import { Expose } from 'class-transformer';
import { Transaction } from 'src/modules/transaction/entities/transaction.entity';
import { Zone } from 'src/modules/zone/entities/zone.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';

@Entity({ name: 'transaction_zone' })
export class TransactionZone {
  @Expose()
  @ManyToOne(() => Transaction, (transaction) => transaction.transactionZones)
  @JoinColumn({ name: 'transaction_id' })
  transaction?: Relation<Transaction>[];

  @Expose({ name: 'transaction_id' })
  @PrimaryColumn({ name: 'transaction_id' })
  transactionId!: number;

  @Expose()
  @ManyToOne(() => Zone, (zone) => zone.transactionZones)
  @JoinColumn({ name: 'zone_id' })
  zone?: Relation<Zone>[];

  @Expose({ name: 'zone_id' })
  @PrimaryColumn({ name: 'zone_id' })
  zoneId!: number;
}
