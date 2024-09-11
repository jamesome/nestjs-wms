import { Inject, Injectable } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { DataSource, Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CONNECTION } from 'src/common/constants';

@Injectable()
export class SupplierService {
  private supplierRepository: Repository<Supplier>;

  constructor(@Inject(CONNECTION) private readonly dataSource: DataSource) {
    this.supplierRepository = this.dataSource.getRepository(Supplier);
  }

  async create(createSupplierDto: CreateSupplierDto) {
    const warehouse = this.supplierRepository.create(createSupplierDto);

    return await this.supplierRepository.save(warehouse);
  }
}
