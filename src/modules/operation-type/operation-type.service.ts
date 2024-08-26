import { Inject, Injectable } from '@nestjs/common';
import { CreateOperationTypeDto } from './dto/create-operation-type.dto';
import { UpdateOperationTypeDto } from './dto/update-operation-type.dto';
import { FindOperationTypeDto } from './dto/find-operation-type.dto';
import { DataSource, Repository } from 'typeorm';
import { OperationType } from './entities/operation-type.entity';
import { CONNECTION } from 'src/common/constants';

@Injectable()
export class OperationTypeService {
  private operationTypeRepository: Repository<OperationType>;

  constructor(@Inject(CONNECTION) private readonly dataSource: DataSource) {
    this.operationTypeRepository = this.dataSource.getRepository(OperationType);
  }

  async create(createOperationTypeDto: CreateOperationTypeDto) {
    const operationType = this.operationTypeRepository.create(
      createOperationTypeDto,
    );
    return await this.operationTypeRepository.save(operationType);
  }

  async findAll(findOperationTypeDto: FindOperationTypeDto) {
    const { category } = findOperationTypeDto;
    const filters: any = {
      where: {
        ...(category && { category }),
      },
      order: {
        id: 'ASC',
      },
    };

    return await this.operationTypeRepository.find(filters);
  }

  async findOne(id: number) {
    return await this.operationTypeRepository.findOne({ where: { id } });
  }

  async update(id: number, updateOperationTypeDto: UpdateOperationTypeDto) {
    await this.operationTypeRepository.update(id, updateOperationTypeDto);
  }

  async remove(id: number) {
    await this.operationTypeRepository.delete(id);
  }
}
