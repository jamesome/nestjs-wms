import { SlipStatus } from 'src/modules/enum';
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class CreateTableStockAllocated1724405195774
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'stock_allocated',
        columns: [
          {
            name: 'transaction_item_id',
            type: 'bigint',
            isNullable: false,
            comment: '(FK) transaction_item 외래키',
          },
          {
            name: 'item_id',
            type: 'bigint',
            isNullable: false,
            comment: '(FK) item 외래키',
          },
          {
            name: 'location_id',
            type: 'int',
            isNullable: false,
            comment: '(FK) location 외래키',
          },
          {
            name: 'lot_id',
            type: 'bigint',
            isNullable: true,
            comment: '(FK) lot 외래키',
          },
          {
            name: 'quantity',
            type: 'int',
            isNullable: false,
            comment: '수량',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'stock_allocated',
      new TableForeignKey({
        name: 'FK_stock_allocated_transaction_item_id', // 외래 키 제약 조건 이름
        columnNames: ['transaction_item_id'], // 외래 키가 추가될 열
        referencedColumnNames: ['id'], // 외래 키가 참조할 열
        referencedTableName: 'transaction_item', // 외래 키가 참조할 테이블
        // onDelete: 'CASCADE', // 연결된 행이 삭제될 때의 동작
      }),
    );

    await queryRunner.createForeignKey(
      'stock_allocated',
      new TableForeignKey({
        name: 'FK_stock_allocated_item_id', // 외래 키 제약 조건 이름
        columnNames: ['item_id'], // 외래 키가 추가될 열
        referencedColumnNames: ['id'], // 외래 키가 참조할 열
        referencedTableName: 'item', // 외래 키가 참조할 테이블
        // onDelete: 'CASCADE', // 연결된 행이 삭제될 때의 동작
      }),
    );

    await queryRunner.createForeignKey(
      'stock_allocated',
      new TableForeignKey({
        name: 'FK_stock_allocated_location_id', // 외래 키 제약 조건 이름
        columnNames: ['location_id'], // 외래 키가 추가될 열
        referencedColumnNames: ['id'], // 외래 키가 참조할 열
        referencedTableName: 'location', // 외래 키가 참조할 테이블
        // onDelete: 'CASCADE', // 연결된 행이 삭제될 때의 동작
      }),
    );

    await queryRunner.createForeignKey(
      'stock_allocated',
      new TableForeignKey({
        name: 'FK_stock_allocated_lot_id', // 외래 키 제약 조건 이름
        columnNames: ['lot_id'], // 외래 키가 추가될 열
        referencedColumnNames: ['id'], // 외래 키가 참조할 열
        referencedTableName: 'lot', // 외래 키가 참조할 테이블
        // onDelete: 'CASCADE', // 연결된 행이 삭제될 때의 동작
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
          '전표상태(scheduled, received, inspected, partial_receiving, partial_in_stock, returned, in_stock, in_transit, transferred, allocated, partial_allocated, shipping, picked, packed, shipped)',
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
          'unallocated',
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
          '전표상태(scheduled, unallocated, received, inspected, partial_receiving, partial_in_stock, returned, in_stock, in_transit, transferred, allocated, shipping, picked, packed, shipped)',
      }),
    );

    await queryRunner.dropForeignKey(
      'stock_allocated',
      'FK_stock_allocated_lot_id',
    );
    await queryRunner.dropForeignKey(
      'stock_allocated',
      'FK_stock_allocated_location_id',
    );
    await queryRunner.dropForeignKey(
      'stock_allocated',
      'FK_stock_allocated_item_id',
    );
    await queryRunner.dropForeignKey(
      'stock_allocated',
      'FK_stock_allocated_transaction_item_id',
    );
    await queryRunner.dropTable('stock_allocated');
  }
}
