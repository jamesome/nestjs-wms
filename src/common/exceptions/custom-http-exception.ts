import { HttpException, HttpStatus } from '@nestjs/common';
// import { HttpStatus } from '../constants';

export class CustomHttpException extends HttpException {
  constructor(message: string | Record<string, any>, status: HttpStatus) {
    super(message, status);
  }

  getResponse(): string | object {
    const response = super.getResponse();

    return {
      ...((typeof response === 'string'
        ? { message: response }
        : response) as object),
    };
  }

  getMessage(): string {
    return super.getResponse()['message'];
  }

  getError(): string {
    return super.getResponse()['error'];
  }
}
