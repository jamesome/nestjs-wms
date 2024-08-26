import { PartialType } from '@nestjs/swagger';
import { CreateOperationTypeDto } from './create-operation-type.dto';

export class UpdateOperationTypeDto extends PartialType(
  CreateOperationTypeDto,
) {}
