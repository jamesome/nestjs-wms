import { HttpStatus as OriginalHttpStatus } from '@nestjs/common';

export enum CustomHttpStatus {
  MULTI_STATUS = 207,
}

export const HttpStatus = {
  ...OriginalHttpStatus,
  ...CustomHttpStatus,
};

// 커넥션 Key
export const CONNECTION = Symbol('CONNECTION');

// addSelect로 계산 된 컬럼을 표현하기 위한 가상의 Key
export const VIRTUAL_COLUMN_KEY = Symbol('VIRTUAL_COLUMN_KEY');

export const MAX_UPLOAD_SIZE = 1000 * 1000 * 10; // 10MB
