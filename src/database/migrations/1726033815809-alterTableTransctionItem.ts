import { SlipStatus, StockStatus } from 'src/modules/enum';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterTableTransctionItem1726033815809
  implements MigrationInterface
{
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
          '전표상태. scheduled(작업예정), received(입하완료), inspected(검품완료), partial_receiving(부분입고진행), partial_in_stock(부분입고완료), returned(반품완료), in_stock(입고완료), in_transit(이동중), transferred(이동완료), allocated(출고지시완료(할당완료)), picking(피킹작업중), picking_hold(피킹보류), picking_failure(피킹실패), picked(피킹완료), packed(패킹완료), shipped(출고완료), canceled(취소완료)',
      }),
    );

    await queryRunner.changeColumn(
      'transaction_item',
      'status',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: Object.values(SlipStatus),
        isNullable: false,
        comment:
          '전표상태. scheduled(작업예정), received(입하완료), inspected(검품완료), partial_receiving(부분입고진행), partial_in_stock(부분입고완료), returned(반품완료), in_stock(입고완료), in_transit(이동중), transferred(이동완료), allocated(출고지시완료(할당완료)), picking(피킹작업중), picking_hold(피킹보류), picking_failure(피킹실패), picked(피킹완료), packed(패킹완료), shipped(출고완료), canceled(취소완료)',
      }),
    );

    await queryRunner.addColumn(
      'transaction_item',
      new TableColumn({
        name: 'picked_quantity',
        type: 'int',
        isNullable: false,
        default: 0,
        comment: '피킹지시 된 수량',
      }),
    );

    await queryRunner.addColumn(
      'transaction_item',
      new TableColumn({
        name: 'image_url',
        type: 'varchar',
        length: '500',
        isNullable: true,
        comment: '품목 이미지 URL',
      }),
    );

    await queryRunner.changeColumn(
      'transaction_item',
      'quantity',
      new TableColumn({
        name: 'ordered_quantity',
        type: 'int',
        isNullable: false,
        comment: '출고 지시 된 수량',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'transaction_item',
      'ordered_quantity',
      new TableColumn({
        name: 'quantity',
        type: 'int',
        isNullable: false,
        comment: '수량',
      }),
    );

    await queryRunner.dropColumn('transaction_item', 'image_url');
    await queryRunner.dropColumn('transaction_item', 'picked_quantity');

    await queryRunner.changeColumn(
      'transaction_item',
      'status',
      new TableColumn({
        name: 'status',
        type: 'enum',
        isNullable: false,
        enum: Object.values(StockStatus),
        default: "'normal'",
        comment: '재고상태. normal(정상), abnormal(비정상), disposed(폐기)',
      }),
    );
  }
}
