import { Module } from '@nestjs/common';
import { OperationTypeService } from './operation-type.service';
import { OperationTypeController } from './operation-type.controller';

@Module({
  controllers: [OperationTypeController],
  providers: [OperationTypeService],
})
export class OperationTypeModule {}
