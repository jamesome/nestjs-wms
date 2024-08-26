import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { LotService } from '../lot/lot.service';
import { ItemService } from '../item/item.service';
import { FileService } from 'src/services/file.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { DateTime } from 'luxon';
import * as fs from 'fs';
import { TransactionListener } from './listeners/transaction.listener';
import { EventsModule } from 'src/events/events.module';

@Module({
  controllers: [TransactionController],
  providers: [
    TransactionService,
    LotService,
    ItemService,
    FileService,
    TransactionListener,
  ],
  imports: [
    EventsModule,
    MulterModule.registerAsync({
      useFactory: () => ({
        storage: diskStorage({
          destination: (_, _file, cb) => {
            const dest = './uploads';
            if (!fs.existsSync(dest)) {
              fs.mkdirSync(dest, { recursive: true });
            }
            cb(null, dest);
          },
          filename: (_, file, cb) => {
            cb(
              null,
              `${DateTime.now().toFormat('HHmmss')}_${Buffer.from(file.originalname, 'ascii').toString('utf8')}`,
            );
          },
        }),
      }),
    }),
  ],
  exports: [TransactionService],
})
export class TransactionModule {}
