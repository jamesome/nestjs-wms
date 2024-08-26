import { Table, TableOptions, TableColumnOptions } from 'typeorm';

export class TimestampedTable extends Table {
  constructor(options: TableOptions) {
    const baseColumns: TableColumnOptions[] = [
      {
        name: 'created_at',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
        isNullable: false,
      },
      {
        name: 'updated_at',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
        isNullable: true,
      },
      {
        name: 'deleted_at',
        type: 'timestamp',
        isNullable: true,
      },
    ];

    super({
      ...options,
      columns: [...(options.columns || []), ...baseColumns],
    });
  }
}
