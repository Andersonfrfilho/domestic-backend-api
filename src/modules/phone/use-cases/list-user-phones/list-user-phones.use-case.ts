import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';
import { TraceMethod } from '@adatechnology/logger';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { UserErrorFactory } from '@modules/user/factories';
import { type UserRepositoryInterface } from '@modules/user/user.repository.interface';
import { USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';

import { USER_PHONE_REPOSITORY_PROVIDE } from '../../phone.token';
import { type UserPhoneRepositoryInterface } from '../../user-phone.repository.interface';

import { LIST_USER_PHONES_LOG_MESSAGES } from './list-user-phones.constants';
import {
  ListUserPhonesUseCaseInterface,
  ListUserPhonesUseCaseParams,
  ListUserPhonesUseCaseResponse,
} from './list-user-phones.interface';

@Injectable()
export class ListUserPhonesUseCase implements ListUserPhonesUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(USER_PHONE_REPOSITORY_PROVIDE)
    private readonly userPhoneRepository: UserPhoneRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute(params: ListUserPhonesUseCaseParams): Promise<ListUserPhonesUseCaseResponse> {
    this.logProvider.info({
      message: LIST_USER_PHONES_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { userId: params.userId },
    });

    const user = await this.userRepository.findById(params.userId);
    if (!user) {
      this.logProvider.warn({
        message: LIST_USER_PHONES_LOG_MESSAGES.USER_NOT_FOUND,
        context: this.logContext,
        meta: { userId: params.userId },
      });
      throw UserErrorFactory.notFound(params.userId);
    }

    const phones = await this.userPhoneRepository.findByUserId(params.userId);

    this.logProvider.info({
      message: LIST_USER_PHONES_LOG_MESSAGES.PHONES_RETRIEVED,
      context: this.logContext,
      meta: { userId: params.userId, phonesCount: phones.length },
    });

    return phones;
  }
}
