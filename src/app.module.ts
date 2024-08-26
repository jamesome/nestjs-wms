import {
  Logger,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
// import { SentryModule } from '@sentry/nestjs/setup';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, RouterModule } from '@nestjs/core';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { validationSchema } from './config/app.config';
import { ThrottlerConfigService } from './config/throttler.config';
import { i18nConfig } from './config/i18n.config';
import { BullModule } from '@nestjs/bull';
import { queueFactory } from './config/queue.config';
import { TenancyModule } from './modules/tenancy/tenancy.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { ZoneModule } from './modules/zone/zone.module';
import { LocationModule } from './modules/location/location.module';
import { ItemModule } from './modules/item/item.module';
import { ItemCodeModule } from './modules/item-code/item-code.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { InventoryItemModule } from './modules/inventory-item/inventory-item.module';
import { ItemSerialModule } from './modules/item-serial/item-serial.module';
import { LotModule } from './modules/lot/lot.module';
import { OperationTypeModule } from './modules/operation-type/operation-type.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter';
import { ThrottlerExceptionFilter } from './common/filters/throttler-exception.filter';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { WinstonModule } from 'nest-winston';
import { winstonOptions } from './config/winston.logger.config';
import { SlackService } from './services/slack/slack.service';
import { HttpModule } from '@nestjs/axios';
import { TransactionB2cOrderModule } from './modules/transaction-b2c-order/transaction-b2c-order.module';
import { TransactionGroupModule } from './modules/transaction-group/transaction-group.module';
import { TransactionZoneModule } from './modules/transaction-zone/transaction-zone.module';
import { FileService } from './services/file.service';
import { EventsModule } from './events/events.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ShipperModule } from './modules/shipper/shipper.module';
import { WaveModule } from './modules/wave/wave.module';
import { WaveTransactionModule } from './modules/wave-transaction/wave-transaction.module';
import { StockAllocationRuleModule } from './modules/stock-allocation-rule/stock-allocation-rule.module';
import { StockAllocationRuleShopModule } from './modules/stock-allocation-rule-shop/stock-allocation-rule-shop.module';
import { StockAllocationRuleZoneModule } from './modules/stock-allocation-rule-zone/stock-allocation-rule-zone.module';
import { ShopModule } from './modules/shop/shop.module';

@Module({
  imports: [
    // SentryModule.forRoot(),
    HttpModule,
    WinstonModule.forRoot(winstonOptions),
    // 환경변수 유효성 검사
    ConfigModule.forRoot({
      isGlobal: true, // 전역에서 env 사용가능
      validationSchema: validationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    // Rate Limiting
    ThrottlerModule.forRootAsync({ useClass: ThrottlerConfigService }),
    // 국제화
    I18nModule.forRootAsync({
      resolvers: [
        {
          use: QueryResolver,
          options: ['lang'],
        },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
      useFactory: i18nConfig,
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: queueFactory,
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot({ wildcard: true }),
    EventsModule,
    // Multi Tenancy
    TenancyModule,
    // domain modules..
    RouterModule.register([
      {
        path: 'tenant/:domain',
        children: [
          WarehouseModule,
          ZoneModule,
          LocationModule,
          ItemModule,
          ItemCodeModule,
          SupplierModule,
          OperationTypeModule,
          TransactionModule,
          InventoryItemModule,
          ShipperModule,
          WaveModule,
          StockAllocationRuleModule,
          ShopModule,
        ],
      },
    ]),
    WarehouseModule,
    ZoneModule,
    LocationModule,
    ItemModule,
    ItemCodeModule,
    SupplierModule,
    InventoryItemModule,
    ItemSerialModule,
    LotModule,
    OperationTypeModule,
    TransactionModule,
    TransactionGroupModule,
    TransactionB2cOrderModule,
    TransactionZoneModule,
    ShipperModule,
    WaveModule,
    WaveTransactionModule,
    StockAllocationRuleModule,
    StockAllocationRuleShopModule,
    StockAllocationRuleZoneModule,
    ShopModule,
  ],
  controllers: [AppController],
  providers: [
    Logger,
    // TODO: 사용하려면 CustomThrottlerGuard 필요
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ThrottlerExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DatabaseExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    SlackService,
    FileService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude('/health-check')
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
