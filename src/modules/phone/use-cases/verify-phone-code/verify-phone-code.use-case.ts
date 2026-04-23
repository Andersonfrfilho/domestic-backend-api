import type { CacheProviderInterface } from '@adatechnology/cache';
import { CACHE_PROVIDER } from '@adatechnology/cache';
import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { PhoneErrorFactory } from '../../factories/phone.error.factory';
import {
  PHONE_REPOSITORY_PROVIDE,
  USER_PHONE_REPOSITORY_PROVIDE,
} from '../../phone.token';
import { type PhoneRepositoryInterface } from '../../phone.repository.interface';
import { type UserPhoneRepositoryInterface } from '../../user-phone.repository.interface';

import { VERIFY_PHONE_CODE_LOG_MESSAGES } from './verify-phone-code.constants';
import {
  VerifyPhoneCodeUseCaseInterface,
  VerifyPhoneCodeUseCaseParams,
  VerifyPhoneCodeUseCaseResponse,
} from './verify-phone-code.interface';

@Injectable()
export class VerifyPhoneCodeUseCase implements VerifyPhoneCodeUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(USER_PHONE_REPOSITORY_PROVIDE)
    private readonly userPhoneRepository: UserPhoneRepositoryInterface,
    @Inject(PHONE_REPOSITORY_PROVIDE)
    private readonly phoneRepository: PhoneRepositoryInterface,
    @Inject(CACHE_PROVIDER)
    private readonly cacheProvider: CacheProviderInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: VerifyPhoneCodeUseCaseParams): Promise<VerifyPhoneCodeUseCaseResponse> {
    this.logProvider.info({
      message: VERIFY_PHONE_CODE_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { userId: params.userId, userPhoneId: params.userPhoneId },
    });

    const userPhone = await this.userPhoneRepository.findById(params.userPhoneId);
    if (!userPhone || userPhone.userId !== params.userId) {
      this.logProvider.warn({
        message: VERIFY_PHONE_CODE_LOG_MESSAGES.USER_PHONE_NOT_FOUND,
        context: this.logContext,
        meta: { userId: params.userId, userPhoneId: params.userPhoneId },
      });
      throw PhoneErrorFactory.userPhoneNotFound(params.userPhoneId);
    }

    if (userPhone.phone?.isVerified) {
      this.logProvider.warn({
        message: VERIFY_PHONE_CODE_LOG_MESSAGES.ALREADY_VERIFIED,
        context: this.logContext,
        meta: { userId: params.userId, userPhoneId: params.userPhoneId },
      });
      throw PhoneErrorFactory.alreadyVerified(userPhone.phoneId);
    }

    const cacheKey = `phone:verification:${params.userPhoneId}`;
    const storedCode = await this.cacheProvider.get<string>({ key: cacheKey });

    this.logProvider.info({
      message: VERIFY_PHONE_CODE_LOG_MESSAGES.DEV_CODE_RECEIVED,
      context: this.logContext,
      meta: { userId: params.userId, userPhoneId: params.userPhoneId, received: params.code, stored: storedCode },
    });

    if (!storedCode) {
      this.logProvider.warn({
        message: VERIFY_PHONE_CODE_LOG_MESSAGES.CODE_NOT_FOUND,
        context: this.logContext,
        meta: { userId: params.userId, userPhoneId: params.userPhoneId },
      });
      throw PhoneErrorFactory.invalidCode();
    }

    if (storedCode !== params.code) {
      this.logProvider.warn({
        message: VERIFY_PHONE_CODE_LOG_MESSAGES.CODE_INVALID,
        context: this.logContext,
        meta: { userId: params.userId, userPhoneId: params.userPhoneId },
      });
      throw PhoneErrorFactory.invalidCode();
    }

    await this.cacheProvider.del({ key: cacheKey });
    await this.phoneRepository.update(userPhone.phoneId, { isVerified: true });

    const updated = await this.userPhoneRepository.findById(params.userPhoneId);

    this.logProvider.info({
      message: VERIFY_PHONE_CODE_LOG_MESSAGES.PHONE_VERIFIED,
      context: this.logContext,
      meta: { userId: params.userId, userPhoneId: params.userPhoneId, phoneId: userPhone.phoneId },
    });

    return updated!;
  }
}
