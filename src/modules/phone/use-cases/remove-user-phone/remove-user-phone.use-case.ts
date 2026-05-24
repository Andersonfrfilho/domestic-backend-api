import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { PhoneErrorFactory } from '../../factories/phone.error.factory';
import { USER_PHONE_REPOSITORY_PROVIDE } from '../../phone.token';
import { type UserPhoneRepositoryInterface } from '../../user-phone.repository.interface';

import { REMOVE_USER_PHONE_LOG_MESSAGES } from './remove-user-phone.constants';
import {
  RemoveUserPhoneUseCaseInterface,
  RemoveUserPhoneUseCaseParams,
} from './remove-user-phone.interface';

@Injectable()
export class RemoveUserPhoneUseCase implements RemoveUserPhoneUseCaseInterface {
  @TraceMethod()
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(USER_PHONE_REPOSITORY_PROVIDE)
    private readonly userPhoneRepository: UserPhoneRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: RemoveUserPhoneUseCaseParams): Promise<void> {
    this.logProvider.info({
      message: REMOVE_USER_PHONE_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { userId: params.userId, userPhoneId: params.userPhoneId },
    });

    const userPhone = await this.userPhoneRepository.findById(params.userPhoneId);
    if (!userPhone || userPhone.userId !== params.userId) {
      this.logProvider.warn({
        message: REMOVE_USER_PHONE_LOG_MESSAGES.USER_PHONE_NOT_FOUND,
        context: this.logContext,
        meta: { userId: params.userId, userPhoneId: params.userPhoneId },
      });
      throw PhoneErrorFactory.userPhoneNotFound(params.userPhoneId);
    }

    await this.userPhoneRepository.delete(params.userPhoneId);

    this.logProvider.info({
      message: REMOVE_USER_PHONE_LOG_MESSAGES.USER_PHONE_REMOVED,
      context: this.logContext,
      meta: { userId: params.userId, userPhoneId: params.userPhoneId },
    });
  }
}
