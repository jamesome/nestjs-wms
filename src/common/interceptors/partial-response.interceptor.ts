import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { HttpStatus } from '../constants';

@Injectable()
export class PartialResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((responseData) => {
        const response = context.switchToHttp().getResponse();
        const requestLength = responseData.requested;
        const responseLength = responseData.result.length ?? 0;

        const getResponseObject = (
          status: number,
          succeedCount: number,
          failedCount: number,
          errors: [],
        ) => {
          response.status(status);
          return {
            counts: {
              total: requestLength,
              succeed: succeedCount,
              failed: failedCount,
            },
            errors,
          };
        };

        if (responseLength === requestLength) {
          return getResponseObject(
            HttpStatus.BAD_REQUEST,
            0,
            requestLength,
            responseData.result,
          );
        } else if (responseLength > 0) {
          return getResponseObject(
            HttpStatus.MULTI_STATUS,
            requestLength - responseLength,
            responseLength,
            responseData.result,
          );
        }

        return getResponseObject(HttpStatus.OK, requestLength, 0, []);
      }),
    );
  }
}
