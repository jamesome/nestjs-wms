import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import './query-builders/custom-get-many';

dotenvConfig();

const configService = new ConfigService();

export const options: DataSourceOptions = {
  type: 'mysql',
  host: configService.getOrThrow<string>('DB_HOST'),
  port: configService.getOrThrow<number>('DB_PORT'),
  database: configService.getOrThrow<string>('DB_NAME'),
  username: configService.getOrThrow<string>('DB_USERNAME'),
  password: configService.getOrThrow<string>('DB_PASSWORD'),
  synchronize: false,
  logging: configService.get<string>('NODE_ENV') !== 'production',
  timezone: 'Z',
};

export const dataSource = new DataSource(options);
