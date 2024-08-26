import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { EntityValidationService } from 'src/common/helpers/entity-validation.service';

@Module({
  controllers: [LocationController],
  providers: [LocationService, EntityValidationService],
})
export class LocationModule {}
