import { Module } from '@nestjs/common';
import { TransactionItemController } from './transaction-item.controller';
import { TransactionItemService } from './transaction-item.service';

@Module({
  controllers: [TransactionItemController],
  providers: [TransactionItemService],
})
export class TransactionItemModule {}
