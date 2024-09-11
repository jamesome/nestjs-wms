import { Inject, Injectable } from '@nestjs/common';
import { DataSource, Like, Repository } from 'typeorm';
import { CONNECTION } from 'src/common/constants';
import { paginate, PaginateConfig, PaginateQuery } from 'nestjs-paginate';
import { Item } from './entities/item.entity';
import { ItemCode } from '../item-code/entities/item-code.entity';
import { InventoryItem } from '../inventory-item/entities/inventory-item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { FindItemDto } from './dto/find-item.dto';

@Injectable()
export class ItemService {
  private itemRepository: Repository<Item>;

  constructor(@Inject(CONNECTION) private readonly dataSource: DataSource) {
    this.itemRepository = this.dataSource.getRepository(Item);
  }

  async create(createItemDto: CreateItemDto) {
    const item = new Item();
    item.shipperId = 1; // TODO: 개선필요
    item.name = createItemDto.name;
    item.property = createItemDto.property;
    item.itemCodes = createItemDto.itemCodes.map((codeDto) => {
      const itemCode = new ItemCode();
      itemCode.code = codeDto.code;

      return itemCode;
    });

    return await this.itemRepository.save(item);
  }

  async find(
    query: PaginateQuery,
    warehouseId: number | null,
    findItemDto: FindItemDto,
  ) {
    const { include } = findItemDto;

    if (include === 'inventory') {
      return await this.getManyItemsWithInventoryList(
        query,
        warehouseId,
        findItemDto,
      );
    }

    return await this.getManyItemsWithOutInventoryList(query, findItemDto);
  }

  async getManyItemsWithInventoryList(
    query: PaginateQuery,
    warehouseId: number | null,
    findItemDto: FindItemDto,
  ) {
    const { name, property, itemCode, shipperName } = findItemDto;
    const queryBuilder = this.itemRepository.createQueryBuilder('item');

    // FIXME: DBMS내의 view 정의를 통해 간결하게 정리하거나, Repository 커스텀 방법을 찾아서 구현 이전방법 모색
    queryBuilder
      .select([
        'item.id',
        'item.name',
        'item.property',
        'item.createdAt',
        'itemCode.id',
        'itemCode.code',
        'supplier.id',
        'supplier.name',
        'item_serial.id',
        'item_serial.serialNo',
        'lot.id',
        'shipper.id',
        'shipper.name',
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select('SUM(inventoryItem.quantity)', 'quantityTotal')
          .from(InventoryItem, 'inventoryItem')
          .where('inventoryItem.item_id = item.id')
          .andWhere('inventoryItem.status <> "disposed"');
      }, 'quantityTotal')
      .addSelect((subQuery) => {
        return subQuery
          .select('SUM(inventoryItem.quantity)', 'quantityAvailable')
          .from(InventoryItem, 'inventoryItem')
          .where('inventoryItem.item_id = item.id')
          .andWhere('inventoryItem.status = "normal"');
      }, 'quantityAvailable')
      .addSelect((subQuery) => {
        return subQuery
          .select('SUM(inventoryItem.quantity)', 'quantityNonAvailable')
          .from(InventoryItem, 'inventoryItem')
          .where('inventoryItem.item_id = item.id')
          .andWhere('inventoryItem.status = "abnormal"');
      }, 'quantityNonAvailable')
      .addSelect((subQuery) => {
        return subQuery
          .select(
            "JSON_ARRAYAGG(JSON_OBJECT('zoneId', t.zoneId, 'zoneName', t.zoneName, 'quantity', t.quantity))",
            'quantityByZone',
          )
          .from((qb) => {
            return qb
              .select('location.zoneId', 'zoneId')
              .addSelect('zone.name', 'zoneName')
              .addSelect('SUM(inventoryItem.quantity)', 'quantity')
              .from(InventoryItem, 'inventoryItem')
              .leftJoin('inventoryItem.location', 'location')
              .leftJoin('location.zone', 'zone')
              .where('inventoryItem.item_id = item.id')
              .andWhere('inventoryItem.status <> "disposed"')
              .groupBy('location.zoneId')
              .orderBy({ 'location.zoneId': 'ASC' });
          }, 't');
      }, 'quantityByZone')
      .addSelect((subQuery) => {
        return subQuery
          .select(
            "JSON_ARRAYAGG(JSON_OBJECT('zoneId', t.zoneId, 'zoneName', t.zoneName, 'status', t.status, 'quantity', t.quantity))",
            'quantity_by_status_in_zone',
          )
          .from((qb) => {
            return qb
              .select('location.zoneId', 'zoneId')
              .addSelect('zone.name', 'zoneName')
              .addSelect('SUM(inventoryItem.quantity)', 'quantity')
              .addSelect('inventoryItem.status', 'status')
              .from(InventoryItem, 'inventoryItem')
              .leftJoin('inventoryItem.location', 'location')
              .leftJoin('location.zone', 'zone')
              .where('inventoryItem.item_id = item.id')
              .andWhere('location.deletedAt IS NULL')
              .groupBy('location.zoneId, inventoryItem.status')
              .orderBy({ 'location.zoneId': 'ASC' });
          }, 't');
      }, 'quantityByStatusInZone');

    queryBuilder
      .leftJoin('item.shipper', 'shipper')
      .leftJoin('item.itemCodes', 'itemCode')
      .leftJoin('item.itemSerials', 'item_serial')
      .leftJoin('item.lots', 'lot')
      .leftJoin('lot.supplier', 'supplier')
      .leftJoin('item.inventoryItems', 'inventoryItem')
      .leftJoin('inventoryItem.location', 'location')
      .leftJoin('location.zone', 'zone')
      .leftJoin('zone.warehouse', 'warehouse');

    warehouseId &&
      queryBuilder.andWhere('warehouse.id = :id', { id: warehouseId });
    shipperName &&
      queryBuilder.andWhere('shipper.name like :name', {
        name: `%${shipperName}%`,
      });
    name &&
      queryBuilder.andWhere('item.name like :name', { name: `%${name}%` });
    property &&
      queryBuilder.andWhere('item.property like :property', {
        property: `%${property}%`,
      });
    itemCode &&
      queryBuilder.andWhere('itemCode.code like :code', {
        code: `%${itemCode}%`,
      });

    queryBuilder.groupBy(
      'item.id, itemCode.id, lot.id, supplier.id, item_serial.id',
    );

    const config: PaginateConfig<Item> = {
      sortableColumns: ['createdAt', 'id'],
      defaultSortBy: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
    };

    const paginatedResult = await paginate(query, queryBuilder, config);

    return {
      ...paginatedResult,
      data: await queryBuilder.getManyItem(),
    };
  }

  async getManyItemsWithOutInventoryList(
    query: PaginateQuery,
    findItemDto: FindItemDto,
  ) {
    const { name, property, itemCode, locationId, shipperName } = findItemDto;
    const whereFilters = {
      ...(name && { name: Like(`%${name}%`) }),
      ...(property && { property: Like(`%${property}%`) }),
      ...(itemCode && { itemCodes: { code: Like(`%${itemCode}%`) } }),
      ...(locationId && { inventoryItems: { locationId } }),
      ...(shipperName && { shipper: { name: Like(`%${shipperName}%`) } }),
    };
    const config: PaginateConfig<Item> = {
      loadEagerRelations: true,
      sortableColumns: ['id', 'createdAt'],
      defaultSortBy: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
    };

    if (Object.keys(whereFilters).length > 0) {
      config.where = whereFilters;
    }

    return paginate(query, this.itemRepository, config);
  }

  async findOne(id: number) {
    return this.itemRepository.findOne({
      where: { id },
    });
  }

  async update(id: number, updateItemDto: UpdateItemDto) {
    await this.itemRepository.update(id, updateItemDto);
  }

  async remove(id: number) {
    await this.itemRepository.softDelete(id);
  }
}
