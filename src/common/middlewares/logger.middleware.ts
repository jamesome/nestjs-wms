import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger as WinstonLogger } from 'winston';
import * as requestIp from 'request-ip';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { protocol, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    const host = req.get('host');
    const fullUrl = `${protocol}://${host}${originalUrl}`;
    const method = req.method;
    const requestBody = req.body;

    const originalSend = res.send;

    res.send = function (body) {
      res.locals.responseBody = body;

      return originalSend.call(res, body);
    };

    res.on('finish', () => {
      const responseBody = res.locals.responseBody;

      try {
        this.logger.http(
          JSON.stringify({
            request: {
              method,
              ip: requestIp.getClientIp(req),
              userAgent,
              fullUrl,
              body:
                typeof requestBody == 'object'
                  ? requestBody
                  : JSON.parse(requestBody),
            },
            response: {
              body:
                !responseBody || responseBody.indexOf('<html') > -1
                  ? {}
                  : JSON.parse(responseBody),
            },
          }),
        );
      } catch (error) {
        console.log(error);
      }
    });

    next();
  }
}
