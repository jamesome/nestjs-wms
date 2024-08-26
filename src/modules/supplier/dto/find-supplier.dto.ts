import { PartialType } from '@nestjs/swagger';
import { CreateSupplierDto } from './create-supplier.dto';

export class FindSupplierDto extends PartialType(CreateSupplierDto) {}
