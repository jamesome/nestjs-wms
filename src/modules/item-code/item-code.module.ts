import { Module } from '@nestjs/common';
import { ItemCodeService } from './item-code.service';
import { ItemCodeController } from './item-code.controller';

@Module({
  controllers: [ItemCodeController],
  providers: [ItemCodeService],
})
export class ItemCodeModule {}
