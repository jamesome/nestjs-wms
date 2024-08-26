import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SlackService {
  private webhookUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.webhookUrl =
      this.configService.getOrThrow<string>('SLACK_WEBHOOK_URL');
  }

  async sendNotification(error: any, info: object) {
    try {
      this.httpService.axiosRef.post(this.webhookUrl, {
        attachments: [
          {
            color: 'danger',
            fields: [
              {
                title: 'Information',
                value: `Ip: ${info['ip']}\nPath: ${info['path']}\nBody: ${JSON.stringify(info['body'])}`,
                short: false,
              },
              { title: 'Error Message', value: error.message, short: false },
              { title: 'Stack Trace', value: error.stack, short: false },
              // ... 필요한 항목 추가
            ],
          },
        ],
      });

      console.log('Slack message sent successfully');
    } catch (error) {
      console.error('Error sending Slack message:', error.message);
    }
  }
}
