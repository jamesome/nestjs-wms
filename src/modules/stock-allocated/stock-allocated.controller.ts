import { Body, Controller, HttpCode, Param, Patch } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { HttpStatus } from 'src/common/constants';
import { CustomHttpException } from 'src/common/exceptions/custom-http.exception';
import { StockAllocatedService } from './stock-allocated.service';
import { UpdateStockAllocatedDto } from './dto/update-stock-allocated.dto';

@Controller('stock-allocations')
@ApiTags('StockAllocated API')
export class StockAllocatedController {
  constructor(private readonly stockAllocatedService: StockAllocatedService) {}

  @ApiExcludeEndpoint()
  @Patch('picking:action')
  async handleAction(
    @Param('action') action: string,
    @Param('id') id: number,
    @Body('data') updateStockAllocatedDto: UpdateStockAllocatedDto,
    @Body('data') updateStockAllocatedArrDto: UpdateStockAllocatedDto[],
  ) {
    if (action === ':batch') {
      return await this.patchBulk(updateStockAllocatedArrDto);
    } else if (action === ':id') {
      return await this.patch(id, updateStockAllocatedDto);
    } else {
      throw new Error('Invalid action');
    }
  }

  @Patch('picking:batch')
  @HttpCode(HttpStatus.NO_CONTENT)
  async patchBulk(
    @Body('data') updateStockAllocatedArrDto: UpdateStockAllocatedDto[],
  ) {
    for (const stockAllocation of updateStockAllocatedArrDto) {
      const { id, ...aaa } = stockAllocation;

      await this.patch(id as number, aaa);
    }
  }

  @Patch('picking/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async patch(
    @Param('id') id: number,
    @Body('data') updateStockAllocatedDto: UpdateStockAllocatedDto,
  ) {
    const stockAllocation = await this.stockAllocatedService.findOne(id);

    if (!stockAllocation) {
      throw new CustomHttpException(
        {
          error: 'Not Found',
          message: 'ENTITY_NOT_FOUND',
          statusCode: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return await this.stockAllocatedService.patch(
      stockAllocation,
      updateStockAllocatedDto,
    );
  }
}
