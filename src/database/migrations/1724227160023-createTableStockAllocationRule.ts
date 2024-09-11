import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';
import { TimestampedTable } from '../timestamped-table';
import { StockAllocationMethod, ZoneFilter } from 'src/modules/enum';

export class CreateTableStockAllocationRule1724227160023
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new TimestampedTable({
        name: 'stock_allocation_rule',
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
            name: 'shipper_id',
            type: 'int',
            isNullable: true,
            comment: '(FK) shipper 외래키',
          },
          {
            name: 'priority',
            type: 'int',
            isNullable: false,
            comment: '우선순위(정렬순서)',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '50',
            isNullable: false,
            isUnique: true,
            comment: '룰 옵션명',
          },
          {
            name: 'method',
            type: 'enum',
            isNullable: false,
            enum: Object.values(StockAllocationMethod),
            default: '"fefo"',
            comment: '재고할당 룰. fefo(선 만료 선출법), lpr(공간 최적화 할당)',
          },
          {
            name: 'zone_filter',
            type: 'enum',
            isNullable: false,
            enum: Object.values(ZoneFilter),
            default: '"include"',
            comment: '존 포함 제외. include (포함), exclude(제외)',
          },
          {
            name: 'is_default',
            type: 'tinyInt',
            isNullable: false,
            comment: '기본 재고할당 룰',
            default: false,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'stock_allocation_rule',
      new TableForeignKey({
        name: 'FK_stock_allocation_rule_shipper_id', // 외래 키 제약 조건 이름
        columnNames: ['shipper_id'], // 외래 키가 추가될 열
        referencedColumnNames: ['id'], // 외래 키가 참조할 열
        referencedTableName: 'shipper', // 외래 키가 참조할 테이블
        // onDelete: 'CASCADE', // 연결된 행이 삭제될 때의 동작
      }),
    );

    await queryRunner.createTable(
      new TimestampedTable({
        name: 'shop',
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
            length: '500', // 셀메이트 판매처명 크기
            isNullable: false,
            isUnique: true,
            comment: '판매처명',
          },
        ],
      }),
    );

    await queryRunner.changeColumn(
      'transaction_b2c_order',
      'shop_name',
      new TableColumn({
        name: 'shop_id',
        type: 'int',
        isNullable: false,
        comment: '(FK) shop 일련번호',
      }),
    );

    await queryRunner.createForeignKey(
      'transaction_b2c_order',
      new TableForeignKey({
        name: 'FK_transaction_b2c_order_shop_id', // 외래 키 제약 조건 이름
        columnNames: ['shop_id'], // 외래 키가 추가될 열
        referencedColumnNames: ['id'], // 외래 키가 참조할 열
        referencedTableName: 'shop', // 외래 키가 참조할 테이블
        // onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'stock_allocation_rule_shop',
        columns: [
          {
            name: 'stock_allocation_rule_id',
            type: 'int',
            isNullable: false,
            comment: '(FK) stock_allocation_rule 외래키',
          },
          {
            name: 'shop_id',
            type: 'int',
            isNullable: false,
            comment: '(FK) shop 외래키',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'stock_allocation_rule_shop',
      new TableForeignKey({
        name: 'FK_stock_allocation_rule_shop_stock_allocation_rule_id', // 외래 키 제약 조건 이름
        columnNames: ['stock_allocation_rule_id'], // 외래 키가 추가될 열
        referencedColumnNames: ['id'], // 외래 키가 참조할 열
        referencedTableName: 'stock_allocation_rule', // 외래 키가 참조할 테이블
        // onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'stock_allocation_rule_shop',
      new TableForeignKey({
        name: 'FK_stock_allocation_rule_shop_shop_id', // 외래 키 제약 조건 이름
        columnNames: ['shop_id'], // 외래 키가 추가될 열
        referencedColumnNames: ['id'], // 외래 키가 참조할 열
        referencedTableName: 'shop', // 외래 키가 참조할 테이블
        // onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'stock_allocation_rule_zone',
        columns: [
          {
            name: 'stock_allocation_rule_id',
            type: 'int',
            isNullable: false,
            comment: '(FK) stock_allocation_rule 외래키',
          },
          {
            name: 'zone_id',
            type: 'int',
            isNullable: false,
            comment: '(FK) zone 외래키',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'stock_allocation_rule_zone',
      new TableForeignKey({
        name: 'FK_stock_allocation_rule_zone_stock_allocation_rule_id', // 외래 키 제약 조건 이름
        columnNames: ['stock_allocation_rule_id'], // 외래 키가 추가될 열
        referencedColumnNames: ['id'], // 외래 키가 참조할 열
        referencedTableName: 'stock_allocation_rule', // 외래 키가 참조할 테이블
        // onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'stock_allocation_rule_zone',
      new TableForeignKey({
        name: 'FK_stock_allocation_rule_zone_zone_id', // 외래 키 제약 조건 이름
        columnNames: ['zone_id'], // 외래 키가 추가될 열
        referencedColumnNames: ['id'], // 외래 키가 참조할 열
        referencedTableName: 'zone', // 외래 키가 참조할 테이블
        // onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'stock_allocation_rule_zone',
      'FK_stock_allocation_rule_zone_zone_id',
    );
    await queryRunner.dropForeignKey(
      'stock_allocation_rule_zone',
      'FK_stock_allocation_rule_zone_stock_allocation_rule_id',
    );
    await queryRunner.dropTable('stock_allocation_rule_zone');

    await queryRunner.dropForeignKey(
      'stock_allocation_rule_shop',
      'FK_stock_allocation_rule_shop_shop_id',
    );
    await queryRunner.dropForeignKey(
      'stock_allocation_rule_shop',
      'FK_stock_allocation_rule_shop_stock_allocation_rule_id',
    );
    await queryRunner.dropTable('stock_allocation_rule_shop');

    await queryRunner.dropForeignKey(
      'transaction_b2c_order',
      'FK_transaction_b2c_order_shop_id',
    );
    await queryRunner.changeColumn(
      'transaction_b2c_order',
      'shop_id',
      new TableColumn({
        name: 'shop_name',
        type: 'varchar',
        length: '500',
        isNullable: true,
        comment: '판매처명',
      }),
    );

    await queryRunner.dropForeignKey(
      'stock_allocation_rule',
      'FK_transaction_b2c_order_shop_id',
    );
    await queryRunner.dropTable('shop');

    await queryRunner.dropForeignKey(
      'stock_allocation_rule',
      'FK_stock_allocation_rule_shipper_id',
    );
    await queryRunner.dropTable('stock_allocation_rule');
  }
}
