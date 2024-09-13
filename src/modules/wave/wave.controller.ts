import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { WaveService } from './wave.service';
import { TransactionService } from 'src/modules/transaction/transaction.service';
import { UpdateWaveDto } from './dto/update-wave.dto';
import { FindWaveDto } from './dto/find-wave.dto';
import { FindTransactionDto } from 'src/modules/transaction/dto/find-transaction.dto';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateWaveDto } from './dto/create-wave.dto';
import { Category, SlipStatus } from '../enum';
import { CustomHttpException } from 'src/common/exceptions/custom-http.exception';
import { HttpStatus } from 'src/common/constants';

@Controller('waves')
@ApiTags('Wave API')
export class WaveController {
  constructor(
    private readonly waveService: WaveService,
    private readonly transactionService: TransactionService,
  ) {}

  @Post()
  @ApiOperation({ summary: '웨이브생성' })
  @ApiCreatedResponse({ description: 'Created' })
  async create(
    @Body('filters') findTransactionDto: FindTransactionDto,
    @Body('filters') createWaveDto: CreateWaveDto,
  ) {
    // 출고이면서, 할당완료 상태만 wave 생성가능.
    findTransactionDto.category = Category.SHIPPING;
    findTransactionDto.status = SlipStatus.ALLOCATED;

    const transactions =
      await this.transactionService.getManyShippingList(findTransactionDto);

    if (!transactions || transactions.length === 0) {
      throw new CustomHttpException(
        {
          error: 'Not Found',
          message: 'ENTITY_NOT_FOUND',
          statusCode: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return await this.waveService.create(createWaveDto, transactions);
  }

  @Get()
  async findAll(@Query() findWaveDto: FindWaveDto) {
    return await this.waveService.findAll(findWaveDto);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.waveService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateWaveDto: UpdateWaveDto) {
    return this.waveService.update(id, updateWaveDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.waveService.remove(id);
  }
}
