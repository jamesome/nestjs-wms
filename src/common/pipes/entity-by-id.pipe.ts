import {
  Injectable,
  PipeTransform,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { CONNECTION } from 'src/common/constants';

export const EntityByIdPipe = (entityClass: EntityClassOrSchema) => {
  @Injectable()
  class EntityByIdPipeMixinPipe implements PipeTransform<number> {
    constructor(@Inject(CONNECTION) private readonly dataSource: DataSource) {}

    async transform(id: number): Promise<any> {
      if (!this.dataSource.isInitialized) {
        throw new Error('DataSource is not initialized');
      }

      const repository = this.dataSource.getRepository(entityClass);
      const entity = await repository.findOneBy({ id });

      if (!entity) {
        // 어떤 entity 조회 시 실패했는디 알려주는 디테일?
        throw new NotFoundException(`Entity with id ${id} not found`);
      }

      return entity;
    }
  }

  return EntityByIdPipeMixinPipe;
};
