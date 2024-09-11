import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CONNECTION, HttpStatus } from 'src/common/constants';
import { DataSource, Raw, Repository } from 'typeorm';
import { DateTime } from 'luxon';
import { CustomHttpException } from 'src/common/exceptions/custom-http.exception';
import { Wave } from './entities/wave.entity';
import { WaveTransaction } from '../wave-transaction/entities/wave-transaction.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { UpdateWaveDto } from './dto/update-wave.dto';
import { FindWaveDto } from './dto/find-wave.dto';
import { CreateWaveDto } from './dto/create-wave.dto';
import { WaveStatus } from '../enum';

@Injectable()
export class WaveService {
  private waveRepository: Repository<Wave>;
  private transactionRepository: Repository<Transaction>;

  constructor(@Inject(CONNECTION) private readonly dataSource: DataSource) {
    this.waveRepository = this.dataSource.getRepository(Wave);
    this.transactionRepository = this.dataSource.getRepository(Transaction);
  }

  async create(createWaveDto: CreateWaveDto, transactions) {
    const { ordersPerWave } = createWaveDto;

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
      withDeleted: true,
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

      // 작업 단위 구성: 지정 된 주문 수 만큼 각 웨이브를 생성
      while (transactions.length) {
        const wave = await createWave();
        const chunk = transactions.splice(0, ordersPerWave);

        const waveTransactionsChunk = await Promise.all(
          chunk.map(async (transaction: Transaction) => {
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
      queryBuilder.andWhere(
        'wave.created_at BETWEEN :createdAt and DATE_ADD(:createdAt, INTERVAL 1 DAY)',
        {
          createdAt,
        },
      );

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
          error: 'Not Found',
          message: 'ENTITY_NOT_FOUND',
          statusCode: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // 웨이브삭제는 상태가 new인경우만 가능
    if (wave.status != WaveStatus.NEW) {
      throw new CustomHttpException(
        {
          error: 'Conflict',
          message: 'CANNOT_DELETE_WAVE',
          statusCode: HttpStatus.CONFLICT,
        },
        HttpStatus.CONFLICT,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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
