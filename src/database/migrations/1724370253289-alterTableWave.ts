import { WaveStatus } from 'src/modules/enum';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterTableWave1724370253289 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
          '웨이브 상태. new(신규), in_progress(작업진행중), canceled(취소)',
      }),
    );
  }
}
