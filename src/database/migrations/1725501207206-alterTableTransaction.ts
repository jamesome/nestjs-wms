import { SlipStatus } from 'src/modules/enum';
import { TableColumn } from 'typeorm';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableTransaction1725501207206 implements MigrationInterface {
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
          '전표상태(scheduled, received, inspected, partial_receiving, partial_in_stock, returned, in_stock, in_transit, transferred, allocated, shipping, picked, packed, shipped)',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
          '전표상태(scheduled, received, inspected, partial_receiving, partial_in_stock, returned, in_stock, in_transit, transferred, partial_allocated, allocated, shipping, picked, packed, shipped)',
      }),
    );
  }
}
