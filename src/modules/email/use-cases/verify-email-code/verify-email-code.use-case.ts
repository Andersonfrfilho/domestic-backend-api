import type { CacheProviderInterface } from '@adatechnology/cache';
import { CACHE_PROVIDER } from '@adatechnology/cache';
import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { EmailErrorFactory } from '../../factories/email.error.factory';
import {
  EMAIL_REPOSITORY_PROVIDE,
  USER_EMAIL_REPOSITORY_PROVIDE,
} from '../../email.token';
import { type EmailRepositoryInterface } from '../../email.repository.interface';
import { type UserEmailRepositoryInterface } from '../../user-email.repository.interface';

import { VERIFY_EMAIL_CODE_LOG_MESSAGES } from './verify-email-code.constants';
import {
  VerifyEmailCodeUseCaseInterface,
  VerifyEmailCodeUseCaseParams,
  VerifyEmailCodeUseCaseResponse,
} from './verify-email-code.interface';

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
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
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

    if (userEmail.email?.isVerified) {
      this.logProvider.warn({
        message: VERIFY_EMAIL_CODE_LOG_MESSAGES.ALREADY_VERIFIED,
        context: this.logContext,
        meta: { userId: params.userId, userEmailId: params.userEmailId },
      });
      throw EmailErrorFactory.alreadyVerified(userEmail.emailId);
    }

    const cacheKey = `email:verification:${params.userEmailId}`;
    const storedCode = await this.cacheProvider.get<string>({ key: cacheKey });

    this.logProvider.info({
      message: VERIFY_EMAIL_CODE_LOG_MESSAGES.CODE_RECEIVED,
      context: this.logContext,
      meta: { userId: params.userId, userEmailId: params.userEmailId, received: params.code, stored: storedCode },
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

    return updated!;
  }
}
