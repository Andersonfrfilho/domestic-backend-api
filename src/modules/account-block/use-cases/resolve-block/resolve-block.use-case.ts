import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TraceMethod } from '@adatechnology/logger';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { AccountBlock } from '@app/modules/shared/providers/database/entities/account-block.entity';

import {
  ResolveAccountBlockUseCaseInterface,
  ResolveAccountBlockParams,
  ResolveAccountBlockResult,
} from './resolve-block.interface';

export const RESOLVE_BLOCK_LOG_MESSAGES = {
  START_FLOW: 'Starting resolve account block flow',
  NOT_FOUND: 'Account block not found',
  ALREADY_RESOLVED: 'Account block already resolved',
  SUCCESS: 'Account block resolved',
} as const;

@Injectable()
export class ResolveAccountBlockUseCase implements ResolveAccountBlockUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @InjectRepository(AccountBlock, CONNECTIONS_NAMES.POSTGRES)
    private readonly accountBlockRepository: Repository<AccountBlock>,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute(params: ResolveAccountBlockParams): Promise<ResolveAccountBlockResult> {
    this.logProvider.info({
      message: RESOLVE_BLOCK_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { blockId: params.blockId },
    });

    const block = await this.accountBlockRepository.findOne({ where: { id: params.blockId } as any });
    if (!block) {
      this.logProvider.warn({
        message: RESOLVE_BLOCK_LOG_MESSAGES.NOT_FOUND,
        context: this.logContext,
        meta: { blockId: params.blockId },
      });
      throw new NotFoundException('Account block not found');
    }

    if (block.resolvedAt) {
      this.logProvider.warn({
        message: RESOLVE_BLOCK_LOG_MESSAGES.ALREADY_RESOLVED,
        context: this.logContext,
        meta: { blockId: params.blockId, resolvedAt: block.resolvedAt },
      });
      throw new NotFoundException('Account block already resolved');
    }

    block.resolvedAt = new Date();
    block.resolvedBy = params.resolvedBy;
    await this.accountBlockRepository.save(block);

    this.logProvider.info({
      message: RESOLVE_BLOCK_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { blockId: params.blockId },
    });

    return { id: block.id, resolvedAt: block.resolvedAt };
  }
}
