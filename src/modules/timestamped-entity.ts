import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export abstract class TimestampedEntity extends BaseEntity {
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @Exclude()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date | null = null;

  @Exclude()
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null = null;
}
