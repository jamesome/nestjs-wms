import { Module } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { WarehouseController } from './warehouse.controller';
import { EntityValidationService } from 'src/common/helpers/entity-validation.service';

@Module({
  controllers: [WarehouseController],
  providers: [WarehouseService, EntityValidationService],
})
export class WarehouseModule {}
