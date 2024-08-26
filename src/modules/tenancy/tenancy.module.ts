import { Global, Module, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Request } from 'express';
import { options } from 'src/database/tenant.dataSource';
import { config as dotenvConfig } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { CONNECTION } from 'src/common/constants';

dotenvConfig();

const configService = new ConfigService();

const connectionFactory = {
  provide: CONNECTION,
  scope: Scope.REQUEST,
  useFactory: async (request: Request) => {
    const database = request.params.domain;

    if (!database) {
      return null;
    }

    // MysqlConnectionCredentialsOptions
    const dataSourceOptions = {
      ...options,
      database,
      entities: ['dist/modules/**/entities/*.entity{.ts,.js}'],
      extra: {
        connectionLimit: configService.get<number>('DB_CONN_IDLETIMEOUT', 10),
        maxIdle: configService.get<number>('DB_CONN_MAXIDLE', 10),
        idleTimeout: configService.get<number>('DB_CONN_IDLETIMEOUT', 60000),
        enableKeepAlive: true,
      },
    };

    const dataSource = new DataSource(dataSourceOptions as DataSourceOptions);
    return await dataSource.initialize();
  },
  inject: [REQUEST],
};

@Global()
@Module({
  providers: [connectionFactory],
  exports: [CONNECTION],
})
export class TenancyModule {}
