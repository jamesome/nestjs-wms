import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { CONNECTION } from 'src/common/constants';
import { I18nService } from 'nestjs-i18n';
import { LotService } from '../lot/lot.service';
import { ItemService } from '../item/item.service';
import { FileService } from 'src/services/file.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { InventoryItemService } from '../inventory-item/inventory-item.service';

describe('TransactionController', () => {
  let controller: TransactionController;

  beforeEach(async () => {
    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue({
        create: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
      }),
    };

    const mockI18nService = {
      translate: jest.fn().mockReturnValue('translated string'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      imports: [EventEmitterModule.forRoot()],
      providers: [
        TransactionService,
        LotService,
        ItemService,
        InventoryItemService,
        FileService,
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

    controller = module.get<TransactionController>(TransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
