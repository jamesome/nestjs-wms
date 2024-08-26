import { SelectQueryBuilder } from 'typeorm';
import 'reflect-metadata';
import { VirtualColumnOptions } from 'src/common/decorators/virtual-column.decorator';
import { VIRTUAL_COLUMN_KEY } from 'src/common/constants';

declare module 'typeorm' {
  interface SelectQueryBuilder<Entity> {
    getManyItem(
      this: SelectQueryBuilder<Entity>,
    ): Promise<Entity[] | undefined>;
    getMany(this: SelectQueryBuilder<Entity>): Promise<Entity[] | undefined>;
    getManyWave(
      this: SelectQueryBuilder<Entity>,
    ): Promise<Entity[] | undefined>;
  }
}

SelectQueryBuilder.prototype.getManyItem = async function () {
  const { entities, raw } = await this.getRawAndEntities();
  let flag = 0;
  let idx = 0;

  const items = entities.map((entity) => {
    while (flag === raw[idx]['item_id']) {
      idx++;
    }

    const metaInfo: Record<string, VirtualColumnOptions> =
      Reflect.getMetadata(VIRTUAL_COLUMN_KEY, entity) ?? {};
    const item = raw[idx];

    for (const [propertyKey, { name, type }] of Object.entries(metaInfo)) {
      if (!name) {
        continue;
      }

      switch (type) {
        case 'number':
          entity[propertyKey] = Number(item[name]);
          break;
        case 'string':
          entity[propertyKey] = String(item[name]);
          break;
        case 'object':
          entity[propertyKey] = Object(item[name]);
          break;
        default:
          entity[propertyKey] = item[name];
          break;
      }
    }

    flag = item['item_id'];

    return entity;
  });

  return [...items];
};

SelectQueryBuilder.prototype.getMany = async function () {
  const { entities, raw } = await this.getRawAndEntities();

  const items = entities.map((entity, index) => {
    const metaInfo: Record<string, VirtualColumnOptions> =
      Reflect.getMetadata(VIRTUAL_COLUMN_KEY, entity) ?? {};
    const item = raw[index];

    for (const [propertyKey, { name, type }] of Object.entries(metaInfo)) {
      if (!name) {
        continue;
      }

      switch (type) {
        case 'number':
          entity[propertyKey] = Number(item[name]);
          break;
        case 'string':
          entity[propertyKey] = String(item[name]);
          break;
        case 'object':
          entity[propertyKey] = Object(item[name]);
          break;
        default:
          entity[propertyKey] = item[name];
          break;
      }
    }

    return entity;
  });

  return [...items];
};

SelectQueryBuilder.prototype.getManyWave = async function () {
  const { entities, raw } = await this.getRawAndEntities();
  let flag = 0;
  let idx = 0;

  const items = entities.map((entity) => {
    while (flag === raw[idx]['wave_id']) {
      idx++;
    }

    const metaInfo: Record<string, VirtualColumnOptions> =
      Reflect.getMetadata(VIRTUAL_COLUMN_KEY, entity) ?? {};
    const item = raw[idx];

    for (const [propertyKey, { name, type }] of Object.entries(metaInfo)) {
      if (!name) {
        continue;
      }

      switch (type) {
        case 'number':
          entity[propertyKey] = Number(item[name]);
          break;
        case 'string':
          entity[propertyKey] = String(item[name]);
          break;
        case 'object':
          entity[propertyKey] = Object(item[name]);
          break;
        default:
          entity[propertyKey] = item[name];
          break;
      }
    }

    flag = item['wave_id'];

    return entity;
  });

  return [...items];
};
