import { NestExpressApplication } from '@nestjs/platform-express';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { snakeCase } from 'lodash';

export default function useI18n(app: NestExpressApplication) {
  app.useGlobalPipes(
    new I18nValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      // FIXME: nestjs-i18n 라이브러리 구현 오류로 인해 ValidationPipe 의 'validationError.target = false' 설정이 적용되지 않음
      // 라이브러리 오류 해결 후 구현 간소화
      errorFormatter: (errors) =>
        errors.map((error) => {
          delete error.target;
          return {
            ...error,
            property: snakeCase(error.property),
          };
        }),
    }),
  );
}
