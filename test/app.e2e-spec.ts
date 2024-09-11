import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { ResponseFormatterInterceptor } from 'src/common/interceptors/response-formatter.interceptor';
import { Reflector } from '@nestjs/core';
import useTemplateEngine from 'src/bootstrap/template-engine';
import useI18n from 'src/bootstrap/i18n';

// FIXME: 테스트 환경을 위한 DB 접속 구성
describe('AppController (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)), // Serializer
      new ResponseFormatterInterceptor(),
    );

    useI18n(app);
    useTemplateEngine(app);

    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect(/Sellmate WMS API/);
  });

  it('Validation Error Format', () => {
    return request(app.getHttpServer())
      .post('/tenant/wms/warehouses')
      .expect('Content-Type', /json/)
      .expect(400)
      .then((response) => {
        const responseBody = response.body;
        expect(responseBody).toHaveProperty('statusCode', 400);
        expect(responseBody).toHaveProperty('message');
        expect(responseBody).toHaveProperty('errors');
        const error = responseBody.errors[0];
        expect(error).toHaveProperty('property');
        expect(error).toHaveProperty('children');
        expect(error).toHaveProperty('constraints');
      });
  });

  it('Not Found Error Format', () => {
    return request(app.getHttpServer())
      .get('/worng_resource_name')
      .expect(404)
      .then((response) => {
        const responseBody = response.body;
        expect(responseBody).toHaveProperty('statusCode', 404);
        expect(responseBody).toHaveProperty('message');
        expect(responseBody).toHaveProperty('error');
      });
  });

  it('Server Error Format', () => {
    return request(app.getHttpServer())
      .get('/raise_server_error')
      .expect(500)
      .then((response) => {
        const responseBody = response.body;
        expect(responseBody).toHaveProperty('statusCode', 500);
        expect(responseBody).toHaveProperty('message');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
