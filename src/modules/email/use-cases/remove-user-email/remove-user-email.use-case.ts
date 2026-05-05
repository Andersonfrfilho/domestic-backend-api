import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { USER_EMAIL_REPOSITORY_PROVIDE } from '../../email.token';
import { EmailErrorFactory } from '../../factories/email.error.factory';
import { type UserEmailRepositoryInterface } from '../../user-email.repository.interface';

import { REMOVE_USER_EMAIL_LOG_MESSAGES } from './remove-user-email.constants';
import {
  RemoveUserEmailUseCaseInterface,
  RemoveUserEmailUseCaseParams,
} from './remove-user-email.interface';

@Injectable()
export class RemoveUserEmailUseCase implements RemoveUserEmailUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(USER_EMAIL_REPOSITORY_PROVIDE)
    private readonly userEmailRepository: UserEmailRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: RemoveUserEmailUseCaseParams): Promise<void> {
    this.logProvider.info({
      message: REMOVE_USER_EMAIL_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { userId: params.userId, userEmailId: params.userEmailId },
    });

    const userEmail = await this.userEmailRepository.findById(params.userEmailId);
    if (!userEmail || userEmail.userId !== params.userId) {
      this.logProvider.warn({
        message: REMOVE_USER_EMAIL_LOG_MESSAGES.USER_EMAIL_NOT_FOUND,
        context: this.logContext,
        meta: { userId: params.userId, userEmailId: params.userEmailId },
      });
      throw EmailErrorFactory.userEmailNotFound(params.userEmailId);
    }

    await this.userEmailRepository.delete(params.userEmailId);

    this.logProvider.info({
      message: REMOVE_USER_EMAIL_LOG_MESSAGES.USER_EMAIL_REMOVED,
      context: this.logContext,
      meta: { userId: params.userId, userEmailId: params.userEmailId },
    });
  }
}
