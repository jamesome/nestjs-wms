import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Inject,
} from '@nestjs/common';
// import { HttpStatus } from '../constants';
import { I18nContext } from 'nestjs-i18n';
import { CustomHttpException } from '../exceptions/custom-http-exception';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger as WinstonLogger } from 'winston';
import { SlackService } from 'src/services/slack/slack.service';
import * as requestIp from 'request-ip';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
    private readonly slackService: SlackService,
  ) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
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

    await this.slackService.sendNotification(exception, {
      ip: requestIp.getClientIp(response.req),
      path: `[${response.req.method}] ${response.req.hostname}${response.req.originalUrl}`,
      body: response.req.body,
    });

    if (exception instanceof CustomHttpException) {
      response.status(statusCode).json({
        statusCode,
        message: exception.getMessage(),
        errors: {
          children: [
            {
              value: '',
              property: '',
              children: [],
              constraints: {
                error:
                  i18n?.t(`error.${exceptionResponse['error']}`) ||
                  'Internal Server Error',
              },
            },
          ],
          constraints: {},
        },
      });
    } else {
      response.status(statusCode).json({
        statusCode,
        message: exception.getResponse()['error'],
        errors: {
          children: [],
          constraints: {
            error: exception.getResponse()['message'],
          },
        },
      });
    }
  }
}
