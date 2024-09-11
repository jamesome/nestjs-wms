import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';
import { TimestampedTable } from '../timestamped-table';
import { SlipStatus, WaveStatus } from 'src/modules/enum';

export class CreateTableWave1723785657633 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new TimestampedTable({
        name: 'wave',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            isNullable: false,
          },
          {
            name: 'sequence',
            type: 'int',
            isNullable: false,
            comment: '하루단위 차수',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '50',
            isNullable: false,
            isUnique: true,
            comment: '웨이브명',
          },
          {
            name: 'status',
            type: 'enum',
            isNullable: false,
            enum: Object.values(WaveStatus),
            default: "'new'",
            comment:
              '웨이브 상태. new(신규), in_progress(작업진행중), canceled(취소)',
          },
          {
            name: 'create_worker',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: '웨이브 작업자',
          },
        ],
      }),
    );

    await queryRunner.changeColumn(
      'transaction',
      'status',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: Object.values(SlipStatus),
        isNullable: false,
        comment:
          '전표상태(scheduled, unallocated, received, inspected, partial_receiving, partial_in_stock, returned, in_stock, in_transit, transferred, allocated, shipping, picked, packed, shipped)',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'wave_transaction',
        columns: [
          {
            name: 'wave_id',
            type: 'bigint',
            isNullable: false,
            comment: '(FK) wave 외래키',
          },
          {
            name: 'transaction_id',
            type: 'bigint',
            isNullable: false,
            comment: '(FK) transaction 외래키',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'wave_transaction',
      new TableForeignKey({
        name: 'FK_wave_transaction_wave_id', // 외래 키 제약 조건 이름
        columnNames: ['wave_id'], // 외래 키가 추가될 열
        referencedColumnNames: ['id'], // 외래 키가 참조할 열
        referencedTableName: 'wave', // 외래 키가 참조할 테이블
        // onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'wave_transaction',
      new TableForeignKey({
        name: 'FK_wave_transaction_transaction_id', // 외래 키 제약 조건 이름
        columnNames: ['transaction_id'], // 외래 키가 추가될 열
        referencedColumnNames: ['id'], // 외래 키가 참조할 열
        referencedTableName: 'transaction', // 외래 키가 참조할 테이블
        // onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'wave_transaction',
      'FK_wave_transaction_transaction_id',
    );
    await queryRunner.dropForeignKey(
      'wave_transaction',
      'FK_wave_transaction_wave_id',
    );
    await queryRunner.dropTable('wave_transaction');

    await queryRunner.changeColumn(
      'transaction',
      'status',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: [
          'scheduled',
          'received',
          'inspected',
          'partial_receiving',
          'partial_in_stock',
          'returned',
          'in_stock',
          'in_transit',
          'transferred',
          'allocated',
          'shipping',
          'picked',
          'packed',
          'shipped',
        ],
        isNullable: false,
        comment:
          '전표상태(scheduled, received, inspected, partial_receiving, partial_in_stock, returned, in_stock, in_transit, transferred, allocated, shipping, picked, packed, shipped)',
      }),
    );

    await queryRunner.dropTable('wave');
  }
}
