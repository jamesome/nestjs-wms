import { Inject, Injectable } from '@nestjs/common';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { DataSource, Repository } from 'typeorm';
import { Zone } from './entities/zone.entity';
import { FindZoneDto } from './dto/find-zone.dto';
import { EntityValidationService } from 'src/common/helpers/entity-validation.service';
import { CONNECTION } from 'src/common/constants';

@Injectable()
export class ZoneService {
  private zoneRepository: Repository<Zone>;

  constructor(
    @Inject(CONNECTION) private readonly dataSource: DataSource,
    private readonly entityValidationService: EntityValidationService,
  ) {
    this.zoneRepository = this.dataSource.getRepository(Zone);
  }

  async create(createZoneDto: CreateZoneDto) {
    const zone = this.zoneRepository.create(createZoneDto);
    return await this.zoneRepository.save(zone);
  }

  // async findAll(findZoneDto: FindZoneDto) {
  //   const { warehouseId } = findZoneDto;
  //   const filters: any = {
  //     relations: { warehouse: true },
  //     where: {
  //       warehouse: {
  //         id: warehouseId,
  //       },
  //       ...(warehouseId && { warehouse: { id: warehouseId } }),
  //     },
  //     order: {
  //       name: 'ASC',
  //     },
  //   };

  //   const zones = await this.zoneRepository.find(filters);

  //   // TODO: 스네이크 케이스로 return 하기 위해 정제.
  //   return zones.map((zone) => ({
  //     id: zone.id,
  //     name: zone.name,
  //     code: zone.code,
  //     created_at: zone.createdAt,
  //     is_default: zone.isDefault,
  //     warehouse: {
  //       id: zone.warehouse.id,
  //       is_default: zone.warehouse.isDefault,
  //     },
  //   }));
  // }

  async findAll(warehouseId: number | null, findZoneDto: FindZoneDto) {
    const { name } = findZoneDto;
    const filters: any = {
      relations: { warehouse: true },
      where: {
        warehouse: {
          id: warehouseId,
        },
        ...(name && { name }),
      },
      order: {
        name: 'ASC',
      },
    };

    return await this.zoneRepository.find(filters);
  }

  async findOne(id: number) {
    return await this.zoneRepository.findOne({
      where: { id },
    });
  }

  async update(id: number, updateZoneDto: UpdateZoneDto) {
    await this.zoneRepository.update(id, updateZoneDto);
  }

  async remove(id: number) {
    const zone = await this.zoneRepository.findOne({
      relations: { locations: { inventoryItems: true } },
      where: { id },
    });

    this.entityValidationService.handleEntityDelete(zone);

    // TODO: 확인 로직도 별도 처리
    if (
      zone?.locations?.some((location) => location.inventoryItems?.length > 0)
    ) {
      this.entityValidationService.validateAssociatedItems();
    }

    await this.zoneRepository.delete(id);
  }
}
