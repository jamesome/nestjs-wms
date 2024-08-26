import { Exclude, Expose } from 'class-transformer';
import {
  // BaseEntity as TypeORMBaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BaseEntity,
} from 'typeorm';

export abstract class TimestampedEntity extends BaseEntity {
  @Expose({ name: 'created_at' })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @Expose({ name: 'updated_at' })
  @Exclude()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date | null = null;

  @Expose({ name: 'deleted_at' })
  @Exclude()
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null = null;
}
