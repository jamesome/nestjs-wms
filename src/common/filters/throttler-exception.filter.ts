import { ArgumentsHost, Catch, ExceptionFilter, Inject } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import { SlackService } from 'src/services/slack/slack.service';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
    private readonly slackService: SlackService,
  ) {}

  async catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

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

    response.status(status).json({
      statusCode: status,
      message: exception.message,
    });
  }
}
