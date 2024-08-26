import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CONNECTION, HttpStatus } from 'src/common/constants';
import { DataSource, Raw, Repository } from 'typeorm';
import { DateTime } from 'luxon';
import { CustomHttpException } from 'src/common/exceptions/custom-http-exception';
import { Wave } from './entities/wave.entity';
import { WaveTransaction } from '../wave-transaction/entities/wave-transaction.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { UpdateWaveDto } from './dto/update-wave.dto';
import { FindWaveDto } from './dto/find-wave.dto';
import { MakeWaveDto } from './dto/make-wave.dto';
import { SlipStatus, WaveStatus } from '../enum';

@Injectable()
export class WaveService {
  private waveRepository: Repository<Wave>;
  private transactionRepository: Repository<Transaction>;

  constructor(@Inject(CONNECTION) private readonly dataSource: DataSource) {
    this.waveRepository = this.dataSource.getRepository(Wave);
    this.transactionRepository = this.dataSource.getRepository(Transaction);
  }

  async create(makeWaveDto: MakeWaveDto, transactions) {
    const { ordersPerWave, ordersToProcess } = makeWaveDto;

    if (!transactions || transactions.length === 0) {
      throw new CustomHttpException(
        {
          error: 'ENTITY_NOT_FOUND',
          message: `Transaction not found`,
          statusCode: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const now = DateTime.now().startOf('day');
    const today = now.toFormat('yyyy-MM-dd');

    const waveEntity = await this.waveRepository.findOne({
      select: { sequence: true },
      where: {
        createdAt: Raw(
          (alias) => `date_format(${alias}, '%Y-%m-%d') = '${today}'`,
        ),
      },
      order: {
        id: 'DESC',
      },
    });
    let sequence = waveEntity ? Number(waveEntity.sequence) + 1 : 1;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const createWave = async () => {
        const wave = new Wave();
        wave.sequence = sequence;
        wave.name = now.toFormat('yyyyMMdd') + '_' + sequence;
        wave.createWorker = 'create_worker_name';

        await queryRunner.manager.save(Wave, wave);

        sequence++;

        return wave;
      };

      const batchSize = 500;
      const waveTransactions: WaveTransaction[] = [];

      // 작업 대상 확정: 총 몇개의 대상 주문을 Wave로 생성 할 것인가.
      const targetOrders = ordersToProcess
        ? transactions.slice(0, ordersToProcess)
        : transactions;

      // 작업 단위 구성: 지정 된 주문 수 만큼 각 웨이브를 생성
      while (targetOrders.length) {
        const wave = await createWave();
        const chunk = ordersPerWave
          ? targetOrders.splice(0, ordersPerWave)
          : targetOrders.splice(0, ordersToProcess);

        const waveTransactionsChunk = await Promise.all(
          chunk.map(async (transaction: Transaction) => {
            // 전표상태 갱신. 작업예정 -> 미할당.
            await queryRunner.manager.update(Transaction, transaction.id, {
              status: SlipStatus.UNALLOCATED,
            });

            const waveTransaction = new WaveTransaction();
            waveTransaction.wave = wave;
            waveTransaction.transaction = transaction;
            return waveTransaction;
          }),
        );

        waveTransactions.push(...waveTransactionsChunk);

        if (waveTransactions.length >= batchSize) {
          await queryRunner.manager.save(WaveTransaction, waveTransactions);
          waveTransactions.length = 0;
        }
      }

      if (waveTransactions.length) {
        await queryRunner.manager.save(WaveTransaction, waveTransactions);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(findWaveDto: FindWaveDto) {
    const { createdAt, orderType } = findWaveDto;
    const queryBuilder = this.waveRepository.createQueryBuilder('wave');

    queryBuilder.addSelect((subQuery) => {
      return subQuery
        .select(
          "JSON_ARRAYAGG(JSON_OBJECT('status', t.status, 'count', t.count))",
        )
        .from((qb) => {
          return qb
            .select('transaction.status', 'status')
            .addSelect('COUNT(transaction.status)', 'count')
            .from(Wave, 'subWave')
            .leftJoin('subWave.waveTransactions', 'waveTransactions')
            .leftJoin('waveTransactions.transaction', 'transaction')
            .where('subWave.id = wave.id')
            .groupBy('transaction.status');
        }, 't');
    }, 'countByStatus');

    createdAt &&
      queryBuilder.andWhere('wave.created_at >= :createdAt', {
        createdAt,
      });

    // 단포 or 합포 필터
    if (orderType) {
      const subQuery = this.transactionRepository
        .createQueryBuilder('subTransaction')
        .select('subTransaction.id')
        .leftJoin('subTransaction.transactionItems', 'subTransactionItem')
        .groupBy('subTransaction.id')
        .having(
          orderType === 'single'
            ? 'COUNT(subTransactionItem.id) = 1 AND SUM(subTransactionItem.quantity) = 1'
            : 'COUNT(subTransactionItem.id) > 1 AND SUM(subTransactionItem.quantity) > 1',
        );

      queryBuilder.leftJoin('wave.waveTransactions', 'waveTransactions');
      queryBuilder.leftJoin('waveTransactions.transaction', 'transaction');
      queryBuilder.andWhere(`transaction.id IN (${subQuery.getQuery()})`);
    }

    queryBuilder.orderBy({ 'wave.createdAt': 'DESC' });

    return await queryBuilder.getManyWave();
  }

  async findOne(id: number) {
    return await this.waveRepository.findOne({
      relations: {
        waveTransactions: {
          transaction: {
            transactionItems: true,
            transactionB2cOrder: true,
          },
        },
      },
      where: { id },
    });
  }

  async update(id: number, updateWaveDto: UpdateWaveDto) {
    console.log(updateWaveDto);
    return `This action updates a #${id} wave`;
  }

  async remove(id: number) {
    const wave = await this.waveRepository.findOne({
      relations: {
        waveTransactions: { transaction: true },
      },
      where: { id },
    });

    if (!wave) {
      throw new CustomHttpException(
        {
          error: 'ENTITY_NOT_FOUND',
          message: 'NOT_FOUND',
          statusCode: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // 웨이브삭제는 상태가 new인경우만 가능
    if (wave.status != WaveStatus.NEW) {
      throw new CustomHttpException(
        {
          error: 'CANNOT_DELETE_WAVE',
          message: 'CONFLICT',
          statusCode: HttpStatus.CONFLICT,
        },
        HttpStatus.CONFLICT,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const waveTransaction of wave.waveTransactions) {
        const transaction = waveTransaction.transaction;
        transaction.status = SlipStatus.SCHEDULED;

        await queryRunner.manager.save(Transaction, transaction);
      }

      await queryRunner.manager.delete(WaveTransaction, {
        waveId: id,
      });
      await queryRunner.manager.softDelete(Wave, id);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException(error);
    } finally {
      await queryRunner.release();
    }
  }
}
