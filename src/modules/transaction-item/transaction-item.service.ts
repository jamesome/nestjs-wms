import { Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CONNECTION } from 'src/common/constants';
import { TransactionItem } from './entities/transaction-item.entity';
import { UpdateTransactionItemDto } from './dto/update-transaction-item.dto';
import { SlipStatus } from '../enum';

@Injectable()
export class TransactionItemService {
  private transactionItemRepository: Repository<TransactionItem>;

  constructor(@Inject(CONNECTION) private readonly dataSource: DataSource) {
    this.transactionItemRepository =
      this.dataSource.getRepository(TransactionItem);
  }

  async findOne(_warehouseId: number, transactionId: number, id: number) {
    const filters: any = {
      relations: {
        transaction: true,
      },
      where: {
        id,
        transaction: {
          id: transactionId,
          // warehouse: {
          //   id: warehouseId,
          // },
        },
      },
    };

    return await this.transactionItemRepository.findOne(filters);
  }

  async patch(
    transactionItem: TransactionItem,
    updateTransactionItemDto: UpdateTransactionItemDto,
  ) {
    if (updateTransactionItemDto.status) {
      await this.handleStatusUpdate(
        transactionItem,
        updateTransactionItemDto.status,
      );
    }

    if (updateTransactionItemDto.pickedQuantity) {
      if (
        transactionItem.pickedQuantity === 0 &&
        updateTransactionItemDto.pickedQuantity > 0
      ) {
        transactionItem.status = SlipStatus.PICKING;
      }

      await this.handlePickedQuantityUpdate(
        transactionItem,
        updateTransactionItemDto.pickedQuantity,
      );
    }

    await this.transactionItemRepository.save(transactionItem);
  }

  private async handleStatusUpdate(
    transactionItem: TransactionItem,
    status: SlipStatus | SlipStatus[],
  ) {
    const updatedStatus = Object.keys(SlipStatus).find(
      (key) => SlipStatus[key] === status,
    );

    if (updatedStatus) {
      transactionItem.status = updatedStatus as SlipStatus;
    }
  }

  private async handlePickedQuantityUpdate(
    transactionItem: TransactionItem,
    pickedQuantity: number,
  ) {
    transactionItem.pickedQuantity = pickedQuantity;
  }
}
