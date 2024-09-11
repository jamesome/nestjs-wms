import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class IndexedCollectionItemDto<ItemType> {
  // 모든 데이터의 index(From 0)
  index!: number;

  @ValidateNested({ each: true })
  @Type(() => Object)
  collectionItem!: ItemType;
}
