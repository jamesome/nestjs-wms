import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ThrottlerModuleOptions,
  ThrottlerOptions,
  ThrottlerOptionsFactory,
} from '@nestjs/throttler';

@Injectable()
export class ThrottlerConfigService implements ThrottlerOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createThrottlerOptions(): ThrottlerModuleOptions {
    // 쓰로틀러 설정 생성
    const throttlerOptions: ThrottlerOptions = {
      ttl: this.configService.get<number>('THROTTLE_TTL') as number,
      limit: this.configService.get<number>('THROTTLE_LIMIT') as number,
    };

    // 쓰로틀러 모듈 옵션 설정
    const throttlerModuleOptions: ThrottlerModuleOptions = {
      throttlers: [throttlerOptions],
      errorMessage: 'Too many requests, please try again later.', // 쓰로틀링 오류 메시지 설정
    };

    return throttlerModuleOptions;
  }
}
