import 'reflect-metadata';
import { VIRTUAL_COLUMN_KEY } from '../constants';

export interface VirtualColumnOptions {
  name?: string;
  type: 'number' | 'string' | 'object';
}

export function VirtualColumn(
  options: VirtualColumnOptions,
): PropertyDecorator {
  return (target, propertyKey) => {
    const metaInfo: Record<string, VirtualColumnOptions> =
      Reflect.getMetadata(VIRTUAL_COLUMN_KEY, target) || {};

    metaInfo[propertyKey as string] = {
      name: options.name ?? propertyKey.toString(),
      type: options.type,
    };

    Reflect.defineMetadata(VIRTUAL_COLUMN_KEY, metaInfo, target);
  };
}
