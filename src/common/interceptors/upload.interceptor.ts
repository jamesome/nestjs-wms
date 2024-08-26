import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DateTime } from 'luxon';
import multer, { diskStorage } from 'multer';
import { Observable } from 'rxjs';

@Injectable()
export class UploadInterceptor implements NestInterceptor {
  private upload = multer({
    storage: diskStorage({
      destination: './uploads',
      filename: (_, file, callback) => {
        return callback(
          null,
          `${DateTime.now().toFormat('yyyyMMdd_HHmmss')}_${file.originalname}`,
        );
      },
    }),
  });

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    return new Observable((observer) => {
      this.upload.single('file')(request, response, (err: any) => {
        if (err) {
          observer.error(err);
        } else {
          next.handle().subscribe(observer);
        }
      });
    });
  }
}
