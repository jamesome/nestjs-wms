import { Test, TestingModule } from '@nestjs/testing';
import { WaveController } from './wave.controller';
import { WaveService } from './wave.service';
import { CONNECTION } from 'src/common/constants';
import { TransactionService } from '../transaction/transaction.service';
import { I18nService } from 'nestjs-i18n';
import { LotService } from '../lot/lot.service';
import { ItemService } from '../item/item.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('WaveController', () => {
  let controller: WaveController;

  beforeEach(async () => {
    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue({
        create: jest.fn(),
        find: jest.fn(),
      }),
    };

    const mockI18nService = {
      translate: jest.fn().mockReturnValue('translated string'),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      controllers: [WaveController],
      providers: [
        WaveService,
        TransactionService,
        LotService,
        ItemService,
        {
          provide: CONNECTION,
          useValue: mockDataSource,
        },
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
      ],
    }).compile();

    controller = module.get<WaveController>(WaveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
