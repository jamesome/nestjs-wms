import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AlterTableStockAllocationRule1724379276954
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'stock_allocation_rule',
      new TableColumn({
        name: 'warehouse_id',
        type: 'int',
        isNullable: false,
        comment: '(FK) warehouse 외래키',
      }),
    );

    queryRunner.createForeignKey(
      'stock_allocation_rule',
      new TableForeignKey({
        name: 'FK_stock_allocation_rule_warehouse_id', // 외래 키 제약 조건 이름
        columnNames: ['warehouse_id'], // 외래 키가 추가될 열
        referencedColumnNames: ['id'], // 외래 키가 참조할 열
        referencedTableName: 'warehouse', // 외래 키가 참조할 테이블
        // onDelete: 'CASCADE', // 연결된 행이 삭제될 때의 동작
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'stock_allocation_rule',
      'FK_stock_allocation_rule_warehouse_id',
    );

    queryRunner.dropColumn('stock_allocation_rule', 'warehouse_id');
  }
}
