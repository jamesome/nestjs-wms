import { ArgumentsHost, Catch, ExceptionFilter, Inject } from '@nestjs/common';
// import { HttpStatus } from '../constants';
import { I18nContext } from 'nestjs-i18n';
import { CustomHttpException } from '../exceptions/custom-http.exception';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger as WinstonLogger } from 'winston';
import * as Sentry from '@sentry/nestjs';

@Catch(CustomHttpException)
export class CustomHttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
  ) {}

  async catch(exception: CustomHttpException, host: ArgumentsHost) {
    Sentry.captureException(exception);
    const i18n = I18nContext.current(host);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const exceptionResponse = exception.getResponse();
    const statusCode = exception.getStatus();

    this.logger.error({
      stack: exception.stack,
      message: JSON.stringify({
        ...exception,
      }),
    });

    response.status(statusCode).json({
      statusCode,
      message:
        i18n?.t(`error.${exception.getMessage()}`) || exception.getMessage(),
      error: exceptionResponse['error'],
    });
  }
}
