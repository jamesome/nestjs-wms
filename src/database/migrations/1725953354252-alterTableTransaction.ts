import { SlipStatus, WaveStatus } from 'src/modules/enum';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterTableTransaction1725953354252 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'transaction',
      'status',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: Object.values(SlipStatus),
        isNullable: false,
        comment:
          '전표상태(scheduled, received, inspected, partial_receiving, partial_in_stock, returned, in_stock, in_transit, transferred, allocated, picking, picking_failure, picked, packed, shipped)',
      }),
    );

    await queryRunner.addColumn(
      'transaction',
      new TableColumn({
        name: 'is_hold',
        type: 'tinyint',
        isNullable: false,
        default: false,
        comment: '보류여부',
      }),
    );

    await queryRunner.changeColumn(
      'wave',
      'status',
      new TableColumn({
        name: 'status',
        type: 'enum',
        isNullable: false,
        enum: Object.values(WaveStatus),
        default: "'new'",
        comment: '웨이브 상태. new(신규), in_progress(작업중), completed(완료)',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'wave',
      'status',
      new TableColumn({
        name: 'status',
        type: 'enum',
        isNullable: false,
        enum: Object.values(WaveStatus),
        default: "'new'",
        comment:
          '웨이브 상태. new(신규), instruct_shipping(출고지시), allocated(할당완료), picking(피킹중), packed(패킹완료)',
      }),
    );
    await queryRunner.dropColumn('transaction', 'is_hold');
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
  }
}
