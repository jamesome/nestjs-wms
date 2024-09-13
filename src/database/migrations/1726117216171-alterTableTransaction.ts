import { SlipStatus } from 'src/modules/enum';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterTableTransaction1726117216171 implements MigrationInterface {
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
          '전표상태. scheduled(작업예정), received(입하완료), inspected(검품완료), partial_receiving(부분입고진행), partial_in_stock(부분입고완료), returned(반품완료), in_stock(입고완료), in_transit(이동중), transferred(이동완료), allocated(출고지시완료(할당완료)), picking(피킹작업중), picking_pause(일시정지), picking_failure(피킹실패), picked(피킹완료), packed(패킹완료), shipped(출고완료), canceled(취소완료)',
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
          '전표상태. scheduled(작업예정), received(입하완료), inspected(검품완료), partial_receiving(부분입고진행), partial_in_stock(부분입고완료), returned(반품완료), in_stock(입고완료), in_transit(이동중), transferred(이동완료), allocated(출고지시완료(할당완료)), picking(피킹작업중), picking_pause(일시정지), picking_failure(피킹실패), picked(피킹완료), packed(패킹완료), shipped(출고완료), canceled(취소완료)',
      }),
    );

    await queryRunner.dropColumn('transaction_item', 'picked_quantity');

    await queryRunner.addColumn(
      'stock_allocated',
      new TableColumn({
        name: 'id',
        type: 'bigint',
        isPrimary: true,
        isGenerated: true,
        generationStrategy: 'increment',
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'stock_allocated',
      new TableColumn({
        name: 'picked_quantity',
        type: 'int',
        isNullable: false,
        default: 0,
        comment: '피킹지시 된 수량',
      }),
    );

    await queryRunner.changeColumn(
      'stock_allocated',
      'quantity',
      new TableColumn({
        name: 'allocated_quantity',
        type: 'int',
        isNullable: false,
        comment: '점유(할당) 된 수량',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'stock_allocated',
      'allocated_quantity',
      new TableColumn({
        name: 'quantity',
        type: 'int',
        isNullable: false,
        comment: '점유(할당) 된 수량',
      }),
    );

    await queryRunner.dropColumn('stock_allocated', 'picked_quantity');
    await queryRunner.dropColumn('stock_allocated', 'id');

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
  }
}
