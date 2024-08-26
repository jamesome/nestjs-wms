import { Module } from '@nestjs/common';
import { ZoneService } from './zone.service';
import { ZoneController } from './zone.controller';
import { EntityValidationService } from 'src/common/helpers/entity-validation.service';

@Module({
  controllers: [ZoneController],
  providers: [ZoneService, EntityValidationService],
})
export class ZoneModule {}
