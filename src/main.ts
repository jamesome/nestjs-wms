// [Sentry] 최상위 import 유지 필수
import './instrument';

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ClassSerializerInterceptor, VersioningType } from '@nestjs/common';
import { ResponseFormatterInterceptor } from './common/interceptors/response-formatter.interceptor';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import useSwagger from './bootstrap/swagger';
import useTemplateEngine from './bootstrap/template-engine';
import useI18n from './bootstrap/i18n';

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

  useI18n(app);
  useTemplateEngine(app);
  useSwagger(app);

  // Versioning
  app.enableVersioning({ type: VersioningType.URI });

  // CORS
  app.enableCors();

  await app.listen(configService.get<number>('APP_PORT', 3000));
}
bootstrap();
