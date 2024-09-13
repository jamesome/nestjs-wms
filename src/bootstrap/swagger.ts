import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import fs from 'fs';

export default function useSwagger(app: INestApplication): void {
  const packageFile = fs.readFileSync(
    `${__dirname}/../../package.json`,
    'utf-8',
  );
  const packageInfo = JSON.parse(packageFile);
  const TITLE = packageInfo.name
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((word: string) =>
      word === 'wms'
        ? word.toUpperCase()
        : word.slice(0, 1).toUpperCase() + word.slice(1),
    )
    .join(' ');

  const config = new DocumentBuilder()
    .setTitle(TITLE)
    .setDescription(packageInfo.description)
    .setVersion(packageInfo.version)
    .addGlobalParameters({
      in: 'header',
      required: false,
      name: 'Accept-Language',
      description: '요청 및 응답에 사용되는 언어(지역) 설정',
      schema: { example: 'ko' },
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const customOptions: SwaggerCustomOptions = {
    customSiteTitle: TITLE,
  };

  SwaggerModule.setup('docs', app, document, customOptions);
}
