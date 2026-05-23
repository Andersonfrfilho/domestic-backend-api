import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TraceMethod } from '@adatechnology/logger';

import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { AccountBlock } from '@app/modules/shared/providers/database/entities/account-block.entity';

import {
  ListAccountBlocksUseCaseInterface,
  ListAccountBlocksParams,
  ListAccountBlocksResult,
} from './list-blocks.interface';

@Injectable()
export class ListAccountBlocksUseCase implements ListAccountBlocksUseCaseInterface {
  constructor(
    @InjectRepository(AccountBlock, CONNECTIONS_NAMES.POSTGRES)
    private readonly accountBlockRepository: Repository<AccountBlock>,
  ) {}

  @TraceMethod()
  async execute(params: ListAccountBlocksParams): Promise<ListAccountBlocksResult> {
    const where: any = {};
    if (params.onlyActive) where.resolvedAt = null;

    const [blocks, total] = await this.accountBlockRepository.findAndCount({
      where,
      order: { blockedAt: 'DESC' },
    });

    return {
      blocks: blocks.map((b) => ({
        id: b.id,
        userId: b.userId,
        reason: b.reason as any,
        message: b.message,
        blockedAt: b.blockedAt,
        resolvedAt: b.resolvedAt,
        canRetryAt: b.canRetryAt,
      })),
      total,
    };
  }
}
