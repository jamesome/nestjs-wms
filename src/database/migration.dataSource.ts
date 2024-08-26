import { DataSource, DataSourceOptions } from 'typeorm';
import { options as baseOptions } from './tenant.dataSource';

const options: DataSourceOptions = {
  ...baseOptions,
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
};

export const dataSource = new DataSource(options);
