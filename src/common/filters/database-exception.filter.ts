import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import { I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from 'src/generated/i18n.generated';
import { SlackService } from 'src/services/slack/slack.service';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter<T extends QueryFailedError>
  implements ExceptionFilter
{
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
    private readonly slackService: SlackService,
  ) {}

  async catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const i18n = I18nContext.current<I18nTranslations>(host);

    this.logger.error({
      stack: exception.stack,
      message: JSON.stringify({
        ...exception,
      }),
    });

    await this.slackService.sendNotification(exception, {
      ip: response.req.ip,
      path: `[${response.req.method}] ${response.req.originalUrl}`,
      body: response.req.body,
    });

    // MySQL의 중복 키 오류 코드: ER_DUP_ENTRY
    if (exception.message.includes('Duplicate entry')) {
      response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Unprocessable Entity',
        errors: [
          {
            children: [
              {
                value: '',
                property: '',
                children: [],
                constraints: { error: i18n?.t('database.DUPLICATE_ENTRY') },
              },
            ],
            constraints: {},
          },
        ],
      });
    } else {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'INTERNAL_SERVER_ERROR',
        errors: [
          {
            children: [],
            constraints: { error: exception.message },
          },
        ],
      });
    }
  }
}
