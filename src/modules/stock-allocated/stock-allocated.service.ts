import { Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CONNECTION } from 'src/common/constants';
import { SlipStatus } from '../enum';
import { StockAllocated } from './entities/stock-allocated.entity';
import { UpdateStockAllocatedDto } from './dto/update-stock-allocated.dto';

@Injectable()
export class StockAllocatedService {
  private stockAllocatedRepository: Repository<StockAllocated>;

  constructor(@Inject(CONNECTION) private readonly dataSource: DataSource) {
    this.stockAllocatedRepository =
      this.dataSource.getRepository(StockAllocated);
  }

  async findOne(id: number) {
    const filters: any = {
      relations: {
        transactionItem: true,
      },
      where: { id },
    };

    return await this.stockAllocatedRepository.findOne(filters);
  }

  // async patchBulk(
  //   stockAllocations: StockAllocated[],
  //   updateStockAllocatedDto: UpdateStockAllocatedDto,
  // ) {
  //   for (const stockAllocation of stockAllocations) {
  //     if (updateStockAllocatedDto.status) {
  //       await this.handleStatusUpdate(
  //         stockAllocation,
  //         updateStockAllocatedDto.status,
  //       );
  //     }

  //     if (updateStockAllocatedDto.pickedQuantity) {
  //       if (
  //         stockAllocation.pickedQuantity === 0 &&
  //         updateStockAllocatedDto.pickedQuantity > 0
  //       ) {
  //         stockAllocation.transactionItem.status = SlipStatus.PICKING;
  //       }

  //       await this.handlePickedQuantityUpdate(
  //         stockAllocation,
  //         updateStockAllocatedDto.pickedQuantity,
  //       );
  //     }
  //   }

  //   await this.stockAllocatedRepository.save(stockAllocations);
  // }

  async patch(
    stockAllocation: StockAllocated,
    updateStockAllocatedDto: UpdateStockAllocatedDto,
  ) {
    if (updateStockAllocatedDto.status) {
      await this.handleStatusUpdate(
        stockAllocation,
        updateStockAllocatedDto.status,
      );
    }

    if (updateStockAllocatedDto.pickedQuantity) {
      if (
        stockAllocation.pickedQuantity === 0 &&
        updateStockAllocatedDto.pickedQuantity > 0
      ) {
        stockAllocation.transactionItem.status = SlipStatus.PICKING;
      }

      await this.handlePickedQuantityUpdate(
        stockAllocation,
        updateStockAllocatedDto.pickedQuantity,
      );
    }

    await this.stockAllocatedRepository.save(stockAllocation);
  }

  private async handleStatusUpdate(
    stockAllocation: StockAllocated,
    status: SlipStatus,
  ) {
    const updatedStatus = Object.keys(SlipStatus).find(
      (key) => SlipStatus[key] === status,
    );

    if (updatedStatus) {
      stockAllocation.transactionItem.status = updatedStatus as SlipStatus;
    }
  }

  private async handlePickedQuantityUpdate(
    stockAllocation: StockAllocated,
    pickedQuantity: number,
  ) {
    stockAllocation.pickedQuantity = pickedQuantity;
  }
}
