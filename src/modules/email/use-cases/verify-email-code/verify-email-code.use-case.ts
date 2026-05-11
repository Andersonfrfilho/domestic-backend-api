import type { CacheProviderInterface } from '@adatechnology/cache';
import { CACHE_PROVIDER } from '@adatechnology/cache';
import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { KEYCLOAK_ADMIN_CLIENT, KeycloakAdminClient } from '@adatechnology/keycloak-admin';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { type QueueProducerMessageProviderInterface } from '@modules/shared/providers/queue/producer/producer.interface';
import { QUEUE_PRODUCER_PROVIDER } from '@modules/shared/providers/queue/producer/producer.token';

import { type EmailRepositoryInterface } from '../../email.repository.interface';
import { EMAIL_REPOSITORY_PROVIDE, USER_EMAIL_REPOSITORY_PROVIDE } from '../../email.token';
import { EmailErrorFactory } from '../../factories/email.error.factory';
import { type UserEmailRepositoryInterface } from '../../user-email.repository.interface';

import { VERIFY_EMAIL_CODE_LOG_MESSAGES } from './verify-email-code.constants';
import {
  VerifyEmailCodeUseCaseInterface,
  VerifyEmailCodeUseCaseParams,
  VerifyEmailCodeUseCaseResponse,
} from './verify-email-code.interface';

const EXCHANGE = 'zolve.events';
const ROUTING_KEY = 'user.email.verified';

@Injectable()
export class VerifyEmailCodeUseCase implements VerifyEmailCodeUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(USER_EMAIL_REPOSITORY_PROVIDE)
    private readonly userEmailRepository: UserEmailRepositoryInterface,
    @Inject(EMAIL_REPOSITORY_PROVIDE)
    private readonly emailRepository: EmailRepositoryInterface,
    @Inject(CACHE_PROVIDER)
    private readonly cacheProvider: CacheProviderInterface,
    @Inject(QUEUE_PRODUCER_PROVIDER)
    private readonly producer: QueueProducerMessageProviderInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
    @Inject(KEYCLOAK_ADMIN_CLIENT)
    private readonly keycloakAdmin: KeycloakAdminClient,
  ) {}

  async execute(params: VerifyEmailCodeUseCaseParams): Promise<VerifyEmailCodeUseCaseResponse> {
    this.logProvider.info({
      message: VERIFY_EMAIL_CODE_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { userId: params.userId, userEmailId: params.userEmailId },
    });

    const userEmail = await this.userEmailRepository.findById(params.userEmailId);
    if (!userEmail || userEmail.userId !== params.userId) {
      this.logProvider.warn({
        message: VERIFY_EMAIL_CODE_LOG_MESSAGES.USER_EMAIL_NOT_FOUND,
        context: this.logContext,
        meta: { userId: params.userId, userEmailId: params.userEmailId },
      });
      throw EmailErrorFactory.userEmailNotFound(params.userEmailId);
    }

    // Email verification status check removed - Email entity doesn't track verification state

    const cacheKey = `email:verification:${params.userEmailId}`;
    const storedCode = await this.cacheProvider.get<string>({ key: cacheKey });

    this.logProvider.info({
      message: VERIFY_EMAIL_CODE_LOG_MESSAGES.CODE_RECEIVED,
      context: this.logContext,
      meta: {
        userId: params.userId,
        userEmailId: params.userEmailId,
        received: params.code,
        stored: storedCode,
      },
    });

    if (!storedCode) {
      this.logProvider.warn({
        message: VERIFY_EMAIL_CODE_LOG_MESSAGES.CODE_NOT_FOUND,
        context: this.logContext,
        meta: { userId: params.userId, userEmailId: params.userEmailId },
      });
      throw EmailErrorFactory.invalidCode();
    }

    if (storedCode !== params.code) {
      this.logProvider.warn({
        message: VERIFY_EMAIL_CODE_LOG_MESSAGES.CODE_INVALID,
        context: this.logContext,
        meta: { userId: params.userId, userEmailId: params.userEmailId },
      });
      throw EmailErrorFactory.invalidCode();
    }

    await this.cacheProvider.del({ key: cacheKey });
    await this.emailRepository.update(userEmail.emailId, { isVerified: true });

    const updated = await this.userEmailRepository.findById(params.userEmailId);

    this.logProvider.info({
      message: VERIFY_EMAIL_CODE_LOG_MESSAGES.EMAIL_VERIFIED,
      context: this.logContext,
      meta: { userId: params.userId, userEmailId: params.userEmailId, emailId: userEmail.emailId },
    });

    // Marca email como verificado no Keycloak com retry
    await this.markEmailVerifiedInKeycloak(params.keycloakId);

    // Publica evento como fallback para outros consumers
    await this.producer
      .send(
        ROUTING_KEY,
        {
          body: {
            user_id: params.userId,
            keycloak_id: params.keycloakId,
            email_id: userEmail.emailId,
            email: userEmail.email?.email,
          },
        },
        { exchange: EXCHANGE, routingKey: ROUTING_KEY },
      )
      .then(() => {
        this.logProvider.info({
          message: VERIFY_EMAIL_CODE_LOG_MESSAGES.EVENT_PUBLISHED,
          context: this.logContext,
          meta: { userId: params.userId, emailId: userEmail.emailId, routingKey: ROUTING_KEY },
        });
      })
      .catch((err: unknown) => {
        this.logProvider.warn({
          message: VERIFY_EMAIL_CODE_LOG_MESSAGES.EVENT_PUBLISH_FAILED,
          context: this.logContext,
          meta: {
            userId: params.userId,
            emailId: userEmail.emailId,
            error: err instanceof Error ? err.message : String(err),
          },
        });
      });

    return updated!;
  }

  private async markEmailVerifiedInKeycloak(keycloakId: string): Promise<void> {
    const method = 'markEmailVerifiedInKeycloak';
    const maxAttempts = 3;
    const delayMs = 1000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const { accessToken } = await this.keycloakAdmin.getAdminToken();
        await this.keycloakAdmin.updateUser({
          userId: keycloakId,
          userData: { emailVerified: true },
          adminToken: accessToken,
        });
        this.logProvider.info({
          message: VERIFY_EMAIL_CODE_LOG_MESSAGES.KEYCLOAK_VERIFIED,
          context: this.logContext,
          meta: { keycloakId },
        });
        return;
      } catch (err: unknown) {
        this.logProvider.warn({
          message: `${VERIFY_EMAIL_CODE_LOG_MESSAGES.KEYCLOAK_VERIFY_ATTEMPT_FAILED} (${attempt}/${maxAttempts})`,
          context: this.logContext,
          meta: { keycloakId, error: err instanceof Error ? err.message : String(err) },
        });
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
        }
      }
    }
  }
}
