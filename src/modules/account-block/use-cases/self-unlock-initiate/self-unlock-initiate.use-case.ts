import type { CacheProviderInterface } from '@adatechnology/nestjs-cache';
import { CACHE_PROVIDER } from '@adatechnology/nestjs-cache';
import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { AccountBlock } from '@app/modules/shared/providers/database/entities/account-block.entity';

import {
  SelfUnlockInitiateUseCaseInterface,
  SelfUnlockInitiateParams,
  SelfUnlockInitiateResult,
} from './self-unlock-initiate.interface';

export const SELF_UNLOCK_INITIATE_LOG_MESSAGES = {
  START_FLOW: 'Starting self-unlock initiate flow',
  BLOCK_NOT_FOUND: 'Active block not found',
  CANNOT_SELF_UNLOCK: 'This block reason does not support self-unlock',
  CODE_SENT: 'Verification code sent to conflicting resource',
} as const;

const ALLOWED_REASONS = ['EMAIL_CONFLICT', 'PHONE_CONFLICT'];

@Injectable()
export class SelfUnlockInitiateUseCase implements SelfUnlockInitiateUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @InjectRepository(AccountBlock, CONNECTIONS_NAMES.POSTGRES)
    private readonly accountBlockRepository: Repository<AccountBlock>,
    @Inject(CACHE_PROVIDER)
    private readonly cacheProvider: CacheProviderInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: SelfUnlockInitiateParams): Promise<SelfUnlockInitiateResult> {
    this.logProvider.info({
      message: SELF_UNLOCK_INITIATE_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { blockId: params.blockId, userId: params.userId },
    });

    const block = await this.accountBlockRepository.findOne({
      where: { id: params.blockId, userId: params.userId, resolvedAt: null } as any,
    });

    if (!block) {
      this.logProvider.warn({
        message: SELF_UNLOCK_INITIATE_LOG_MESSAGES.BLOCK_NOT_FOUND,
        context: this.logContext,
        meta: { blockId: params.blockId },
      });
      throw new NotFoundException('Block not found');
    }

    if (!ALLOWED_REASONS.includes(block.reason)) {
      this.logProvider.warn({
        message: SELF_UNLOCK_INITIATE_LOG_MESSAGES.CANNOT_SELF_UNLOCK,
        context: this.logContext,
        meta: { blockId: params.blockId, reason: block.reason },
      });
      throw new NotFoundException('This block cannot be self-unlocked');
    }

    const destination = (block.metadata as any)?.conflictingResource ?? '';
    if (!destination) {
      throw new NotFoundException('Conflicting resource not found');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.cacheProvider.set({
      key: `self-unlock:${params.blockId}:code`,
      value: code,
      ttlInSeconds: 300, // 5 minutos
    });

    await this.cacheProvider.set({
      key: `self-unlock:${params.blockId}:attempts`,
      value: '0',
      ttlInSeconds: 3600,
    });

    this.logProvider.info({
      message: SELF_UNLOCK_INITIATE_LOG_MESSAGES.CODE_SENT,
      context: this.logContext,
      meta: { blockId: params.blockId, destination },
    });

    return { success: true, message: `Código enviado para ${destination}`, destination, expiresIn: 300 };
  }
}
