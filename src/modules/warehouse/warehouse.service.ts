import { Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { Warehouse } from './entities/warehouse.entity';
import { FindWarehouseDto } from './dto/find-warehouse.dto';
import { EntityValidationService } from 'src/common/helpers/entity-validation.service';
import { paginate, PaginateConfig, PaginateQuery } from 'nestjs-paginate';
import { CONNECTION } from 'src/common/constants';

@Injectable()
export class WarehouseService {
  private warehouseRepository: Repository<Warehouse>;

  constructor(
    @Inject(CONNECTION) private readonly dataSource: DataSource,
    private readonly entityValidationService: EntityValidationService,
  ) {
    this.warehouseRepository = this.dataSource.getRepository(Warehouse);
  }

  async create(createWarehouseDto: CreateWarehouseDto) {
    const warehouse = this.warehouseRepository.create(createWarehouseDto);

    warehouse.createWorker = 'create_worker_name'; // TODO: 추후, User로 대체

    return await this.warehouseRepository.save(warehouse);
  }

  async findAll(query: PaginateQuery, findWarehouseDto: FindWarehouseDto) {
    // FIXME: Find Option으로 아래쿼리 구현이 안 됨
    // WHERE ( `warehouse`.`id` = ? AND `warehouse`.`code` like ? AND (`warehouse`.`address` like ? or `warehouse`.`detail_address` like ?) )
    // const { id, name, code, address } = findWarehouseDto;
    // const findOptions: any = {
    //   where: [
    //     {
    //       ...(id && { id }),
    //       ...(name && { name: Like(`%${name}%`) }),
    //       ...(code && { code: Like(`%${code}%`) }),
    //       ...(address && [
    //         { address: Like(`%${address}%`) },
    //         { detailAddress: Like(`%${address}%`) },
    //       ]),
    //     },
    //   ],
    //   order: {
    //     name: 'ASC',
    //   },
    // };

    // // FIXME: DTO 활용하는 방향으로 개선.
    // const warehouses = await this.warehouseRepository.find(findOptions);

    // return warehouses.map((warehouse) => ({
    //   id: warehouse.id,
    //   name: warehouse.name,
    //   code: warehouse.code,
    //   post_code: warehouse.postCode,
    //   address: warehouse.address,
    //   detail_address: warehouse.detailAddress,
    //   manager: warehouse.manager,
    //   contact: warehouse.contact,
    //   create_worker: warehouse.createWorker,
    //   created_at: warehouse.createdAt,
    // }));

    const { id, name, code, address, isDefault } = findWarehouseDto;
    const queryBuilder =
      this.warehouseRepository.createQueryBuilder('warehouse');

    id && queryBuilder.andWhere('warehouse.id = :id', { id });
    name &&
      queryBuilder.andWhere('warehouse.name like :name', { name: `%${name}%` });
    code &&
      queryBuilder.andWhere('warehouse.code like :code', { code: `%${code}%` });
    address &&
      queryBuilder.andWhere(
        '(warehouse.address like :address or warehouse.detailAddress like :detailAddress)',
        {
          address: `%${address}%`,
          detailAddress: `%${address}%`,
        },
      );
    isDefault &&
      queryBuilder.andWhere('warehouse.is_default = :isDefault', {
        isDefault,
      });

    const config: PaginateConfig<Warehouse> = {
      sortableColumns: ['createdAt', 'name'],
      defaultSortBy: [['createdAt', 'DESC']],
    };

    return paginate(query, queryBuilder, config);
  }

  async findOne(id: number) {
    return await this.warehouseRepository.findOne({
      where: { id },
    });
  }

  async update(id: number, updateWarehouseDto: UpdateWarehouseDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (updateWarehouseDto.isDefault) {
        // 기존의 isDefault가 true인 레코드를 false로 업데이트
        await queryRunner.manager.update(
          Warehouse,
          { isDefault: 1 },
          { isDefault: 0 },
        );
      }

      await queryRunner.manager.update(Warehouse, id, updateWarehouseDto);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const warehouse = await this.warehouseRepository.findOne({
      relations: { zones: { locations: { inventoryItems: true } } },
      where: { id },
    });

    this.entityValidationService.handleEntityDelete(warehouse);

    // TODO: 확인 로직도 별도 처리
    if (
      warehouse?.zones?.some((zone) =>
        zone?.locations?.some(
          (location) =>
            location?.inventoryItems && location.inventoryItems.length > 0,
        ),
      )
    ) {
      this.entityValidationService.validateAssociatedItems();
    }

    await this.warehouseRepository.delete(id);
  }
}
