import { Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { FindLocationDto } from './dto/find-location.dto';
import { EntityValidationService } from 'src/common/helpers/entity-validation.service';
import { InventoryItem } from '../inventory-item/entities/inventory-item.entity';
import { paginate, PaginateConfig, PaginateQuery } from 'nestjs-paginate';
import { CONNECTION } from 'src/common/constants';

@Injectable()
export class LocationService {
  private locationRepository: Repository<Location>;

  constructor(
    @Inject(CONNECTION) private readonly dataSource: DataSource,
    private readonly entityValidationService: EntityValidationService,
  ) {
    this.locationRepository = this.dataSource.getRepository(Location);
  }

  async create(createLocationDto: CreateLocationDto) {
    const location = this.locationRepository.create(createLocationDto);

    location.createWorker = 'create_worker_name'; // TODO: 추후 변경 필요

    return await this.locationRepository.save(location);
  }

  async findAll(
    query: PaginateQuery,
    warehouseId: number | null,
    findLocationDto: FindLocationDto,
  ) {
    const { name, zoneName } = findLocationDto;
    const queryBuilder = this.locationRepository.createQueryBuilder('location');

    queryBuilder.select(['location', 'zone']).addSelect((subQuery) => {
      return subQuery
        .select('SUM(inventoryItem.quantity)', 'quantity')
        .from(InventoryItem, 'inventoryItem')
        .where('inventoryItem.location_id = location.id');
    }, 'quantity');

    queryBuilder.leftJoin('location.zone', 'zone');
    queryBuilder.leftJoin('zone.warehouse', 'warehouse');

    warehouseId &&
      queryBuilder.andWhere('warehouse.id = :id', { id: warehouseId });
    name &&
      queryBuilder.andWhere('location.name like :name', { name: `%${name}%` });
    zoneName &&
      queryBuilder.andWhere('zone.name like :name', {
        name: `%${zoneName}%`,
      });

    queryBuilder.groupBy('location.id');

    const config: PaginateConfig<Location> = {
      sortableColumns: ['createdAt', 'name'],
      defaultSortBy: [['createdAt', 'DESC']],
    };

    const paginatedResult = await paginate(query, queryBuilder, config);

    return {
      ...paginatedResult,
      data: await queryBuilder.getMany(),
    };
  }

  async findOne(id: number) {
    return await this.locationRepository.findOne({
      relations: { zone: true },
      where: { id },
    });
  }

  async update(id: number, updateLocationDto: UpdateLocationDto) {
    await this.locationRepository.update(id, updateLocationDto);
  }

  async remove(id: number) {
    const location = await this.locationRepository.findOne({
      relations: { inventoryItems: true },
      where: { id },
    });

    this.entityValidationService.handleEntityDelete(location);

    // TODO: 확인 로직도 별도 처리
    if (location?.inventoryItems && location?.inventoryItems.length > 0) {
      this.entityValidationService.validateAssociatedItems();
    }

    await this.locationRepository.delete(id);
  }
}
