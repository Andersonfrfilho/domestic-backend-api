import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TraceMethod } from '@adatechnology/logger';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { AccountBlock } from '@app/modules/shared/providers/database/entities/account-block.entity';

import {
  CreateAccountBlockUseCaseInterface,
  CreateAccountBlockParams,
  CreateAccountBlockResult,
} from './create-block.interface';

export const CREATE_BLOCK_LOG_MESSAGES = {
  START_FLOW: 'Starting create account block flow',
  SUCCESS: 'Account block created',
} as const;

@Injectable()
export class CreateAccountBlockUseCase implements CreateAccountBlockUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @InjectRepository(AccountBlock, CONNECTIONS_NAMES.POSTGRES)
    private readonly accountBlockRepository: Repository<AccountBlock>,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute(params: CreateAccountBlockParams): Promise<CreateAccountBlockResult> {
    this.logProvider.info({
      message: CREATE_BLOCK_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { userId: params.userId, reason: params.reason },
    });

    const block = await this.accountBlockRepository.save({
      userId: params.userId,
      reason: params.reason,
      message: params.message ?? null,
      canRetryAt: params.canRetryAt ?? null,
      metadata: params.metadata ?? null,
    });

    this.logProvider.info({
      message: CREATE_BLOCK_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { blockId: block.id, userId: params.userId, reason: params.reason },
    });

    return { id: block.id, userId: block.userId, reason: block.reason as any, blockedAt: block.blockedAt };
  }
}
