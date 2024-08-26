import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CONNECTION, HttpStatus } from 'src/common/constants';
import { CustomHttpException } from 'src/common/exceptions/custom-http-exception';
import { CreateStockAllocationRuleDto } from './dto/create-stock-allocation-rule.dto';
import { UpdateStockAllocationRuleDto } from './dto/update-stock-allocation-rule.dto';
import { StockAllocationRule } from './entities/stock-allocation-rule.entity';
import { StockAllocationRuleShop } from '../stock-allocation-rule-shop/entities/stock-allocation-rule-shop.entity';
import { Shop } from '../shop/entities/shop.entity';
import { Zone } from '../zone/entities/zone.entity';
import { StockAllocationRuleZone } from '../stock-allocation-rule-zone/entities/stock-allocation-rule-zone.entity';
import { Shipper } from '../shipper/entities/shipper.entity';
import { Warehouse } from '../warehouse/entities/warehouse.entity';
import { UpdatePriorityDto } from './dto/update-priority.dto';

@Injectable()
export class StockAllocationRuleService {
  private stockAllocationRuleRepository: Repository<StockAllocationRule>;

  constructor(@Inject(CONNECTION) private readonly dataSource: DataSource) {
    this.stockAllocationRuleRepository =
      this.dataSource.getRepository(StockAllocationRule);
  }

  async create(
    warehouseId: number,
    createStockAllocationRuleDto: CreateStockAllocationRuleDto,
  ) {
    const { shopIds, zoneIds, ...stockAllocationRuleDto } =
      createStockAllocationRuleDto;
    const stockAllocationRuleEntity =
      await this.stockAllocationRuleRepository.findOne({
        select: { priority: true },
        where: { isDefault: 0 },
        order: {
          priority: 'DESC',
        },
      });

    const priority = stockAllocationRuleEntity
      ? Number(stockAllocationRuleEntity.priority) + 1
      : 1;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const stockAllocationRule = new StockAllocationRule();

      if (stockAllocationRuleDto.shipperId) {
        const shipper = await queryRunner.manager.findOne(Shipper, {
          where: { id: stockAllocationRuleDto.shipperId },
        });

        if (shipper) {
          stockAllocationRule.shipper = shipper;
        }
      }

      const warehouse = await queryRunner.manager.findOne(Warehouse, {
        where: { id: warehouseId },
      });

      if (!warehouse) {
        throw new CustomHttpException(
          {
            error: 'ENTITY_NOT_FOUND',
            message: `Warehouse with ID ${warehouseId} not found`,
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      stockAllocationRule.warehouse = warehouse;
      stockAllocationRule.priority = priority;
      stockAllocationRule.name = stockAllocationRuleDto.name;
      stockAllocationRule.method = stockAllocationRuleDto.method;
      stockAllocationRule.zoneFilter = stockAllocationRuleDto.zoneFilter;
      stockAllocationRule.isDefault = 0;

      await queryRunner.manager.save(StockAllocationRule, stockAllocationRule);

      if (shopIds && shopIds.length > 0) {
        for (const shopId of shopIds) {
          const shop = await queryRunner.manager.findOne(Shop, {
            where: { id: shopId },
          });

          if (!shop) {
            throw new CustomHttpException(
              {
                error: 'ENTITY_NOT_FOUND',
                message: `Shop with ID ${shopId} not found`,
                statusCode: HttpStatus.NOT_FOUND,
              },
              HttpStatus.NOT_FOUND,
            );
          }

          const stockAllocationRuleShop = new StockAllocationRuleShop();
          stockAllocationRuleShop.stockAllocationRule = stockAllocationRule;
          stockAllocationRuleShop.shop = shop;
          await queryRunner.manager.save(
            StockAllocationRuleShop,
            stockAllocationRuleShop,
          );
        }
      }

      if (zoneIds && zoneIds.length > 0) {
        for (const zoneId of zoneIds) {
          const zone = await queryRunner.manager.findOne(Zone, {
            where: { id: zoneId },
          });

          if (!zone) {
            throw new CustomHttpException(
              {
                error: 'ENTITY_NOT_FOUND',
                message: `Zone with ID ${zoneId} not found`,
                statusCode: HttpStatus.NOT_FOUND,
              },
              HttpStatus.NOT_FOUND,
            );
          }

          const stockAllocationRuleZone = new StockAllocationRuleZone();
          stockAllocationRuleZone.stockAllocationRule = stockAllocationRule;
          stockAllocationRuleZone.zone = zone;
          await queryRunner.manager.save(
            StockAllocationRuleZone,
            stockAllocationRuleZone,
          );
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(warehouseId: number) {
    return await this.stockAllocationRuleRepository.find({
      where: { warehouseId },
    });
  }

  async findOne(warehouseId: number, id: number) {
    return await this.stockAllocationRuleRepository.findOne({
      relations: {
        shipper: true,
        stockAllocationRuleShops: { shop: true },
        stockAllocationRuleZones: { zone: true },
      },
      where: { warehouseId, id },
    });
  }

  async update(
    warehouseId: number,
    id: number,
    updateStockAllocationRuleDto: UpdateStockAllocationRuleDto,
  ) {
    const { shopIds, zoneIds, ...stockAllocationRuleDto } =
      updateStockAllocationRuleDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const stockAllocationRule = await queryRunner.manager.findOne(
        StockAllocationRule,
        {
          where: { warehouseId, id },
        },
      );

      if (!stockAllocationRule) {
        throw new CustomHttpException(
          {
            error: 'ENTITY_NOT_FOUND',
            message: `StockAllocationRule with id ${id} not found`,
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (stockAllocationRuleDto.shipperId) {
        const shipper = await queryRunner.manager.findOne(Shipper, {
          where: { id: stockAllocationRuleDto.shipperId },
        });

        if (shipper) {
          stockAllocationRule.shipper = shipper;
        }
      }
      stockAllocationRule.name = stockAllocationRuleDto.name;
      stockAllocationRule.priority = stockAllocationRuleDto.priority;
      stockAllocationRule.method = stockAllocationRuleDto.method;
      stockAllocationRule.zoneFilter = stockAllocationRuleDto.zoneFilter;

      await queryRunner.manager.save(StockAllocationRule, stockAllocationRule);

      await queryRunner.manager.delete(StockAllocationRuleShop, {
        stockAllocationRule: { id },
      });

      await queryRunner.manager.delete(StockAllocationRuleZone, {
        stockAllocationRule: { id },
      });

      if (shopIds && shopIds.length > 0) {
        for (const shopId of shopIds) {
          const shop = await queryRunner.manager.findOne(Shop, {
            where: { id: shopId },
          });

          if (!shop) {
            throw new CustomHttpException(
              {
                error: 'ENTITY_NOT_FOUND',
                message: `Shop with ID ${shopId} not found`,
                statusCode: HttpStatus.NOT_FOUND,
              },
              HttpStatus.NOT_FOUND,
            );
          }

          const stockAllocationRuleShop = new StockAllocationRuleShop();
          stockAllocationRuleShop.stockAllocationRule = stockAllocationRule;
          stockAllocationRuleShop.shop = shop;
          await queryRunner.manager.save(
            StockAllocationRuleShop,
            stockAllocationRuleShop,
          );
        }
      }

      if (zoneIds && zoneIds.length > 0) {
        for (const zoneId of zoneIds) {
          const zone = await queryRunner.manager.findOne(Zone, {
            where: { id: zoneId },
          });

          if (!zone) {
            throw new CustomHttpException(
              {
                error: 'ENTITY_NOT_FOUND',
                message: `Zone with ID ${zoneId} not found`,
                statusCode: HttpStatus.NOT_FOUND,
              },
              HttpStatus.NOT_FOUND,
            );
          }

          const stockAllocationRuleZone = new StockAllocationRuleZone();
          stockAllocationRuleZone.stockAllocationRule = stockAllocationRule;
          stockAllocationRuleZone.zone = zone;
          await queryRunner.manager.save(
            StockAllocationRuleZone,
            stockAllocationRuleZone,
          );
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(warehouseId: number, id: number) {
    const stockAllocationRule =
      await this.stockAllocationRuleRepository.findOne({
        where: { warehouseId, id },
      });

    if (!stockAllocationRule) {
      throw new CustomHttpException(
        {
          error: 'ENTITY_NOT_FOUND',
          message: `StockAllocationRule with id ${id} not found`,
          statusCode: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.stockAllocationRuleRepository.softDelete(id);

    // const queryRunner = this.dataSource.createQueryRunner();
    // await queryRunner.connect();
    // await queryRunner.startTransaction();

    // try {
    //   await queryRunner.manager.delete(StockAllocationRuleShop, {
    //     stockAllocationRuleId: id,
    //   });
    //   await queryRunner.manager.delete(StockAllocationRuleZone, {
    //     stockAllocationRuleId: id,
    //   });
    //   await queryRunner.manager.softDelete(StockAllocationRule, id);

    //   await queryRunner.commitTransaction();
    // } catch (error) {
    //   await queryRunner.rollbackTransaction();

    //   throw new InternalServerErrorException(error);
    // } finally {
    //   await queryRunner.release();
    // }
  }

  async updatePriority(
    warehouseId: number,
    id: number,
    updatePriorityDto: UpdatePriorityDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const stockAllocationRule = await queryRunner.manager.findOne(
        StockAllocationRule,
        {
          where: { warehouseId, id },
        },
      );
      if (!stockAllocationRule) {
        throw new CustomHttpException(
          {
            error: 'ENTITY_NOT_FOUND',
            message: `StockAllocationRule with id ${id} not found`,
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      const oldPriority = stockAllocationRule.priority;
      const newPriority = updatePriorityDto.priority;

      if (newPriority > oldPriority) {
        // 순서를 올리는 경우 (새로운 순서가 더 큰 경우)
        await queryRunner.manager
          .createQueryBuilder()
          .update(StockAllocationRule)
          .set({ priority: () => 'priority - 1' }) // 중간 순서를 한 칸씩 올림
          .where('priority > :oldPriority AND priority <= :newPriority', {
            oldPriority,
            newPriority,
          })
          .execute();
      } else if (newPriority < oldPriority) {
        // 순서를 내리는 경우 (새로운 순서가 더 작은 경우)
        await queryRunner.manager
          .createQueryBuilder()
          .update(StockAllocationRule)
          .set({ priority: () => 'priority + 1' }) // 중간 순서를 한 칸씩 내림
          .where('priority >= :newPriority AND priority < :oldPriority', {
            newPriority,
            oldPriority,
          })
          .execute();
      }

      await queryRunner.manager.update(StockAllocationRule, id, {
        priority: newPriority,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error);
    } finally {
      await queryRunner.release();
    }
  }
}
