import { Injectable, HttpStatus } from '@nestjs/common';
import { CustomHttpException } from '../exceptions/custom-http.exception';

@Injectable()
export class EntityValidationService {
  validateExistence<T>(entity: T | null | undefined): asserts entity is T {
    if (!entity) {
      throw new CustomHttpException(
        {
          error: 'ENTITY_NOT_FOUND',
          message: 'ENTITY_NOT_FOUND',
          statusCode: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  validateDefaultValue(entity: any): void {
    if (entity.isDefault) {
      throw new CustomHttpException(
        {
          error: 'BAD_REQUEST',
          message: 'CANNOT_DELETE_DUE_TO_DEFAULT_VALUE',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  validateAssociatedItems(): void {
    throw new CustomHttpException(
      {
        error: 'BAD_REQUEST',
        message: 'CANNOT_DELETE_DUE_TO_ASSOCIATED_ITEMS',
        statusCode: HttpStatus.BAD_REQUEST,
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  handleEntityDelete(entity: any): void {
    this.validateExistence(entity);
    this.validateDefaultValue(entity);
  }
}
