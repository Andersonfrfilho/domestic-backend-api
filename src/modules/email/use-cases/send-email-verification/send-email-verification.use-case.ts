import type { CacheProviderInterface } from '@adatechnology/cache';
import { CACHE_PROVIDER } from '@adatechnology/cache';
import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { USER_EMAIL_REPOSITORY_PROVIDE } from '../../email.token';
import { EmailErrorFactory } from '../../factories/email.error.factory';
import { type UserEmailRepositoryInterface } from '../../user-email.repository.interface';

import {
  EMAIL_VERIFICATION_DEV_CODE,
  EMAIL_VERIFICATION_TTL_SECONDS,
  SEND_EMAIL_VERIFICATION_LOG_MESSAGES,
} from './send-email-verification.constants';
import {
  SendEmailVerificationUseCaseInterface,
  SendEmailVerificationUseCaseParams,
} from './send-email-verification.interface';

@Injectable()
export class SendEmailVerificationUseCase implements SendEmailVerificationUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(USER_EMAIL_REPOSITORY_PROVIDE)
    private readonly userEmailRepository: UserEmailRepositoryInterface,
    @Inject(CACHE_PROVIDER)
    private readonly cacheProvider: CacheProviderInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: SendEmailVerificationUseCaseParams): Promise<void> {
    this.logProvider.info({
      message: SEND_EMAIL_VERIFICATION_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { userId: params.userId, userEmailId: params.userEmailId },
    });

    const userEmail = await this.userEmailRepository.findById(params.userEmailId);
    if (!userEmail || userEmail.userId !== params.userId) {
      this.logProvider.warn({
        message: SEND_EMAIL_VERIFICATION_LOG_MESSAGES.USER_EMAIL_NOT_FOUND,
        context: this.logContext,
        meta: { userId: params.userId, userEmailId: params.userEmailId },
      });
      throw EmailErrorFactory.userEmailNotFound(params.userEmailId);
    }

    if (userEmail.email?.isVerified) {
      this.logProvider.warn({
        message: SEND_EMAIL_VERIFICATION_LOG_MESSAGES.ALREADY_VERIFIED,
        context: this.logContext,
        meta: {
          userId: params.userId,
          userEmailId: params.userEmailId,
          emailId: userEmail.emailId,
        },
      });
      throw EmailErrorFactory.alreadyVerified(userEmail.emailId);
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const code = isProduction ? this.generateRandomCode() : EMAIL_VERIFICATION_DEV_CODE;
    const cacheKey = `email:verification:${params.userEmailId}`;

    await this.cacheProvider.set({
      key: cacheKey,
      value: code,
      ttlInSeconds: EMAIL_VERIFICATION_TTL_SECONDS,
    });

    this.logProvider.info({
      message: SEND_EMAIL_VERIFICATION_LOG_MESSAGES.CODE_GENERATED,
      context: this.logContext,
      meta: { userId: params.userId, userEmailId: params.userEmailId, code },
    });

    this.logProvider.info({
      message: SEND_EMAIL_VERIFICATION_LOG_MESSAGES.CODE_STORED,
      context: this.logContext,
      meta: { userEmailId: params.userEmailId, ttl: EMAIL_VERIFICATION_TTL_SECONDS },
    });

    if (!isProduction) {
      this.logProvider.info({
        message: SEND_EMAIL_VERIFICATION_LOG_MESSAGES.CODE_SKIPPED_NON_PROD,
        context: this.logContext,
        meta: { userId: params.userId, userEmailId: params.userEmailId },
      });
      return;
    }

    // TODO: integrate with email/notification provider to actually send the code
    this.logProvider.info({
      message: SEND_EMAIL_VERIFICATION_LOG_MESSAGES.CODE_SENT,
      context: this.logContext,
      meta: { userId: params.userId, userEmailId: params.userEmailId },
    });
  }

  private generateRandomCode(): string {
    return String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
  }
}
