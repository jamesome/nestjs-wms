import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class CreateTableShipper1723769148151 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'shipper',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '50',
            isNullable: false,
            isUnique: true,
            comment: '화주명',
          },
        ],
      }),
    );

    await queryRunner.addColumn(
      'item',
      new TableColumn({
        name: 'shipper_id',
        type: 'int',
        isNullable: false,
        comment: '(FK) shipper 일련번호',
      }),
    );

    await queryRunner.createForeignKey(
      'item',
      new TableForeignKey({
        name: 'FK_item_shipper_id', // 외래 키 제약 조건 이름
        columnNames: ['shipper_id'], // 외래 키가 추가될 열
        referencedColumnNames: ['id'], // 외래 키가 참조할 열
        referencedTableName: 'shipper', // 외래 키가 참조할 테이블
        // onDelete: 'CASCADE', // 연결된 행이 삭제될 때의 동작
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('item', 'FK_item_shipper_id');
    await queryRunner.dropColumn('item', 'shipper_id');
    await queryRunner.dropTable('shipper');
  }
}
