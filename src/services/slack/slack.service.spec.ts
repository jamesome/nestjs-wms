import { Test, TestingModule } from '@nestjs/testing';
import { SlackService } from './slack.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

describe('SlackService', () => {
  let service: SlackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        SlackService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              if (key === 'SLACK_WEBHOOK_URL') {
                return 'https://hooks.slack.com/services/test/webhook/url';
              }
              throw new Error(`Configuration key "${key}" does not exist`);
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SlackService>(SlackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
