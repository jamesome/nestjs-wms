import { Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CONNECTION } from 'src/common/constants';
import { Shop } from './entities/shop.entity';

@Injectable()
export class ShopService {
  private shopRepository: Repository<Shop>;

  constructor(@Inject(CONNECTION) private readonly dataSource: DataSource) {
    this.shopRepository = this.dataSource.getRepository(Shop);
  }

  async findAll() {
    return await this.shopRepository.find();
  }
}
