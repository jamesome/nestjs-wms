// import './instrument';

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ClassSerializerInterceptor, VersioningType } from '@nestjs/common';
import { join } from 'path';
import { setupSwagger } from './config/swagger.config';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { ResponseFormatterInterceptor } from './common/interceptors/response-formatter.interceptor';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { snakeCase } from 'lodash';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Winston-log
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Interceptor
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)), // Serializer
    new ResponseFormatterInterceptor(),
  );

  // Pipe
  app.useGlobalPipes(
    new I18nValidationPipe({
      // whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Filter
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      // detailedErrors: true,
      errorFormatter: (errors) => {
        const children = errors.map((error) => ({
          value: error.value,
          property: snakeCase(error.property),
          children: error.children,
          constraints: error.constraints,
        }));

        return { children, constraints: {} };
      },
    }),
  );

  // Public
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // views
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  // Template engine
  app.setViewEngine('hbs');

  // Versioning
  app.enableVersioning({ type: VersioningType.URI });

  // Swagger
  setupSwagger(app);

  // CORS
  app.enableCors();

  await app.listen(configService.get<number>('APP_PORT', 3000));
}
bootstrap();
