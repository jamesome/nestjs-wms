import { PartialType } from '@nestjs/swagger';
import { CreateOperationTypeDto } from './create-operation-type.dto';

export class FindOperationTypeDto extends PartialType(CreateOperationTypeDto) {}
