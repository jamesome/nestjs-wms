import { ArgumentsHost, Catch, ExceptionFilter, Inject } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import * as Sentry from '@sentry/nestjs';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
  ) {}

  async catch(exception: ThrottlerException, host: ArgumentsHost) {
    Sentry.captureException(exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    this.logger.error({
      stack: exception.stack,
      message: JSON.stringify({
        ...exception,
      }),
    });

    response.status(status).json({
      statusCode: status,
      message: exception.message,
    });
  }
}
