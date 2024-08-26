import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { options as baseOptions } from './tenant.dataSource';

const options: DataSourceOptions & SeederOptions = {
  ...baseOptions,
  entities: ['src/modules/**/entities/*.entity{.ts,.js}'],
  seeds: [__dirname + '/seeds/*{.ts,.js}'],
  seedTracking: false,
  factories: [__dirname + '/factories/*{.ts,.js}'],
};

export const dataSource = new DataSource(options);
