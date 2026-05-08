import type { CacheProviderInterface } from '@adatechnology/cache';
import { CACHE_PROVIDER } from '@adatechnology/cache';
import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { AccountBlock } from '@app/modules/shared/providers/database/entities/account-block.entity';
import type { EmailRepositoryInterface } from '@modules/email/email.repository.interface';
import { EMAIL_REPOSITORY_PROVIDE } from '@modules/email/email.token';
import type { QueueProducerMessageProviderInterface } from '@modules/shared/providers/queue/producer/producer.interface';
import { QUEUE_PRODUCER_PROVIDER } from '@modules/shared/providers/queue/producer/producer.token';

import {
  SelfUnlockVerifyUseCaseInterface,
  SelfUnlockVerifyParams,
  SelfUnlockVerifyResult,
} from './self-unlock-verify.interface';

export const SELF_UNLOCK_VERIFY_LOG_MESSAGES = {
  START_FLOW: 'Starting self-unlock verify flow',
  BLOCK_NOT_FOUND: 'Active block not found',
  CODE_INVALID: 'Invalid verification code',
  CODE_EXPIRED: 'Verification code expired',
  MAX_ATTEMPTS: 'Maximum verification attempts reached',
  SUCCESS: 'Self-unlock successful — block resolved and link transferred',
  ATTEMPT_FAILED: 'Verification attempt failed',
} as const;

const MAX_ATTEMPTS = 3;

@Injectable()
export class SelfUnlockVerifyUseCase implements SelfUnlockVerifyUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @InjectRepository(AccountBlock, CONNECTIONS_NAMES.POSTGRES)
    private readonly accountBlockRepository: Repository<AccountBlock>,
    @Inject(EMAIL_REPOSITORY_PROVIDE)
    private readonly emailRepository: EmailRepositoryInterface,
    @Inject(CACHE_PROVIDER)
    private readonly cacheProvider: CacheProviderInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
    @Inject(QUEUE_PRODUCER_PROVIDER)
    private readonly producer: QueueProducerMessageProviderInterface,
  ) {}

  async execute(params: SelfUnlockVerifyParams): Promise<SelfUnlockVerifyResult> {
    this.logProvider.info({
      message: SELF_UNLOCK_VERIFY_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { blockId: params.blockId, userId: params.userId },
    });

    const block = await this.accountBlockRepository.findOne({
      where: { id: params.blockId, userId: params.userId, resolvedAt: null } as any,
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    // Check attempts
    const attemptsKey = `self-unlock:${params.blockId}:attempts`;
    const attemptsRaw = await this.cacheProvider.get<string>({ key: attemptsKey });
    const attempts = parseInt(attemptsRaw ?? '0', 10);

    if (attempts >= MAX_ATTEMPTS) {
      this.logProvider.warn({
        message: SELF_UNLOCK_VERIFY_LOG_MESSAGES.MAX_ATTEMPTS,
        context: this.logContext,
        meta: { blockId: params.blockId },
      });
      throw new ConflictException('Muitas tentativas. O código expirou.');
    }

    // Verify code
    const codeKey = `self-unlock:${params.blockId}:code`;
    const storedCode = await this.cacheProvider.get<string>({ key: codeKey });

    if (!storedCode) {
      this.logProvider.warn({
        message: SELF_UNLOCK_VERIFY_LOG_MESSAGES.CODE_EXPIRED,
        context: this.logContext,
        meta: { blockId: params.blockId },
      });
      throw new NotFoundException('Código expirado. Solicite um novo.');
    }

    if (storedCode !== params.code) {
      await this.cacheProvider.set({ key: attemptsKey, value: String(attempts + 1), ttlInSeconds: 3600 });

      this.logProvider.warn({
        message: SELF_UNLOCK_VERIFY_LOG_MESSAGES.ATTEMPT_FAILED,
        context: this.logContext,
        meta: { blockId: params.blockId, attempt: attempts + 1 },
      });

      throw new ConflictException('Código inválido');
    }

    // Success — resolve block + transfer link
    block.resolvedAt = new Date();
    block.resolvedBy = params.userId;
    await this.accountBlockRepository.save(block);

    const destination = (block.metadata as any)?.conflictingResource ?? '';
    if (destination && block.reason === 'EMAIL_CONFLICT') {
      const existing = await this.emailRepository.findByEmail(destination);
      if (existing) {
        await this.emailRepository.update(existing.id, { isVerified: true });
      }
    }

    await this.cacheProvider.del({ key: codeKey });
    await this.cacheProvider.del({ key: attemptsKey });

    // Publica notificação para o antigo dono
    this.producer
      .send(
        'notifications.email',
        {
          body: {
            to: destination,
            template_id: 'link_transferred',
            variables: { resource: destination, newOwnerId: params.userId },
          },
        },
        { exchange: 'zolve.events', routingKey: 'notifications.email' },
      )
      .then(() => {
        this.logProvider.info({
          message: 'Notification sent to previous link owner',
          context: this.logContext,
          meta: { destination },
        });
      })
      .catch(() => {
        // Fire-and-forget — não deve travar o fluxo
      });

    this.logProvider.info({
      message: SELF_UNLOCK_VERIFY_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { blockId: params.blockId, userId: params.userId, destination },
    });

    return { success: true, blockResolved: true, message: 'Conta desbloqueada com sucesso' };
  }
}
