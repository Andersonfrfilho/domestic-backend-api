import type { CacheProviderInterface } from '@adatechnology/cache';
import { CACHE_PROVIDER } from '@adatechnology/cache';
import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { PhoneErrorFactory } from '../../factories/phone.error.factory';
import { USER_PHONE_REPOSITORY_PROVIDE } from '../../phone.token';
import { type UserPhoneRepositoryInterface } from '../../user-phone.repository.interface';

import {
  PHONE_VERIFICATION_CODE_LENGTH,
  PHONE_VERIFICATION_TTL_SECONDS,
  SEND_PHONE_VERIFICATION_LOG_MESSAGES,
} from './send-phone-verification.constants';
import {
  SendPhoneVerificationUseCaseInterface,
  SendPhoneVerificationUseCaseParams,
} from './send-phone-verification.interface';

@Injectable()
export class SendPhoneVerificationUseCase implements SendPhoneVerificationUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(USER_PHONE_REPOSITORY_PROVIDE)
    private readonly userPhoneRepository: UserPhoneRepositoryInterface,
    @Inject(CACHE_PROVIDER)
    private readonly cacheProvider: CacheProviderInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: SendPhoneVerificationUseCaseParams): Promise<void> {
    this.logProvider.info({
      message: SEND_PHONE_VERIFICATION_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { userId: params.userId, userPhoneId: params.userPhoneId },
    });

    const userPhone = await this.userPhoneRepository.findById(params.userPhoneId);
    if (!userPhone || userPhone.userId !== params.userId) {
      this.logProvider.warn({
        message: SEND_PHONE_VERIFICATION_LOG_MESSAGES.USER_PHONE_NOT_FOUND,
        context: this.logContext,
        meta: { userId: params.userId, userPhoneId: params.userPhoneId },
      });
      throw PhoneErrorFactory.userPhoneNotFound(params.userPhoneId);
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const code = isProduction
      ? this.generateRandomCode(PHONE_VERIFICATION_CODE_LENGTH)
      : this.getDevCode(userPhone.phone?.number ?? '');

    const cacheKey = `phone:verification:${params.userPhoneId}`;

    await this.cacheProvider.set({
      key: cacheKey,
      value: code,
      ttlInSeconds: PHONE_VERIFICATION_TTL_SECONDS,
    });

    this.logProvider.info({
      message: SEND_PHONE_VERIFICATION_LOG_MESSAGES.CODE_STORED,
      context: this.logContext,
      meta: { userPhoneId: params.userPhoneId, ttl: PHONE_VERIFICATION_TTL_SECONDS },
    });

    this.logProvider.info({
      message: SEND_PHONE_VERIFICATION_LOG_MESSAGES.DEV_CODE_GENERATED,
      context: this.logContext,
      meta: { userId: params.userId, userPhoneId: params.userPhoneId, code },
    });

    if (!isProduction) {
      this.logProvider.info({
        message: SEND_PHONE_VERIFICATION_LOG_MESSAGES.CODE_SKIPPED_NON_PROD,
        context: this.logContext,
        meta: { userId: params.userId, userPhoneId: params.userPhoneId },
      });
      return;
    }

    // TODO: integrate with SMS/notification provider to actually send the code
    this.logProvider.info({
      message: SEND_PHONE_VERIFICATION_LOG_MESSAGES.CODE_SENT,
      context: this.logContext,
      meta: { userId: params.userId, userPhoneId: params.userPhoneId },
    });
  }

  private generateRandomCode(length: number): string {
    const max = Math.pow(10, length);
    const code = Math.floor(Math.random() * max);
    return String(code).padStart(length, '0');
  }

  private getDevCode(phoneNumber: string): string {
    const digits = phoneNumber.replace(/\D/g, '');
    return digits
      .slice(-PHONE_VERIFICATION_CODE_LENGTH)
      .padStart(PHONE_VERIFICATION_CODE_LENGTH, '0');
  }
}
