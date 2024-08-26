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
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { MakeWaveDto } from './dto/make-wave.dto';
import { Category, SlipStatus } from '../enum';

@Controller('waves')
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
    @Body('filters') makeWaveDto: MakeWaveDto,
  ) {
    // 출고이면서, 작업예정 상태만 wave 생성가능.
    if (!findTransactionDto.category) {
      findTransactionDto.category = Category.SHIPPING;
    }
    if (!findTransactionDto.status || findTransactionDto.status.length === 0) {
      findTransactionDto.status = [SlipStatus.SCHEDULED];
    }

    const transactions =
      await this.transactionService.getManyShippingInstructionList(
        findTransactionDto,
      );

    return await this.waveService.create(makeWaveDto, transactions);
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
