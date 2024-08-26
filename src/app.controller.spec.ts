import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Sellmate WMS API"', () => {
      const expectResponse = appController.root();
      const compareValue = { message: 'Sellmate WMS API' };
      expect(expectResponse).toStrictEqual(compareValue);
    });
  });
});
