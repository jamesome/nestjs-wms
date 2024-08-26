import { Inject, Injectable } from '@nestjs/common';
import { Shipper } from './entities/shipper.entity';
import { DataSource, Repository } from 'typeorm';
import { CONNECTION } from 'src/common/constants';
import { FindShipperDto } from './dto/find-shipper.dto';

@Injectable()
export class ShipperService {
  private shipperRepository: Repository<Shipper>;

  constructor(@Inject(CONNECTION) private readonly dataSource: DataSource) {
    this.shipperRepository = this.dataSource.getRepository(Shipper);
  }

  async findAll(findShipperDto: FindShipperDto) {
    const { name } = findShipperDto;
    const filters: any = {
      where: {
        ...(name && { name }),
      },
    };

    return await this.shipperRepository.find(filters);
  }

  async findOne(id: number) {
    return await this.shipperRepository.findOne({
      where: { id },
    });
  }
}
