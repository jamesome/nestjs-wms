// import { WinstonLogger } from 'nest-winston';
import { LoggerMiddleware } from './logger.middleware';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Test, TestingModule } from '@nestjs/testing';

describe('LoggingMiddleware', () => {
  let middleware: LoggerMiddleware;
  // let logger: WinstonLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerMiddleware,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: {
            http: jest.fn(),
          },
        },
      ],
    }).compile();

    middleware = module.get<LoggerMiddleware>(LoggerMiddleware);
    // logger = module.get<WinstonLogger>(WINSTON_MODULE_PROVIDER);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });
});
