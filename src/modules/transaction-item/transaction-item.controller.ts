import { Body, Controller, HttpCode, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransactionItemService } from './transaction-item.service';
import { UpdateTransactionDto } from '../transaction/dto/update-transaction.dto';
import { HttpStatus } from 'src/common/constants';
import { CustomHttpException } from 'src/common/exceptions/custom-http.exception';

@Controller([
  'transaction-item',
  'warehouses/:warehouseId/transactions/:transactionId/transaction-items',
])
@ApiTags('TransactionItem API')
export class TransactionItemController {
  constructor(
    private readonly transactionItemService: TransactionItemService,
  ) {}

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async patch(
    @Param('warehouseId') warehouseId: number,
    @Param('transactionId') transactionId: number,
    @Param('id') id: number,
    @Body('data') updateTransactionDto: UpdateTransactionDto,
  ) {
    const transactionItem = await this.transactionItemService.findOne(
      warehouseId,
      transactionId,
      id,
    );

    if (!transactionItem) {
      throw new CustomHttpException(
        {
          error: 'Not Found',
          message: 'ENTITY_NOT_FOUND',
          statusCode: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return await this.transactionItemService.patch(
      transactionItem,
      updateTransactionDto,
    );
  }
}
