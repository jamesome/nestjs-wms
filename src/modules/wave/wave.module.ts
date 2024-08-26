import { Module } from '@nestjs/common';
import { WaveService } from './wave.service';
import { WaveController } from './wave.controller';
import { TransactionModule } from 'src/modules/transaction/transaction.module';

@Module({
  imports: [TransactionModule],
  controllers: [WaveController],
  providers: [WaveService],
})
export class WaveModule {}
