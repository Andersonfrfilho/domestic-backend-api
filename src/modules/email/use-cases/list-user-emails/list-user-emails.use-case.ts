import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { UserErrorFactory } from '@modules/user/factories';
import { type UserRepositoryInterface } from '@modules/user/user.repository.interface';
import { USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';

import { USER_EMAIL_REPOSITORY_PROVIDE } from '../../email.token';
import { type UserEmailRepositoryInterface } from '../../user-email.repository.interface';

import { LIST_USER_EMAILS_LOG_MESSAGES } from './list-user-emails.constants';
import {
  ListUserEmailsUseCaseInterface,
  ListUserEmailsUseCaseParams,
  ListUserEmailsUseCaseResponse,
} from './list-user-emails.interface';

@Injectable()
export class ListUserEmailsUseCase implements ListUserEmailsUseCaseInterface {
  @TraceMethod()
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(USER_EMAIL_REPOSITORY_PROVIDE)
    private readonly userEmailRepository: UserEmailRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: ListUserEmailsUseCaseParams): Promise<ListUserEmailsUseCaseResponse> {
    this.logProvider.info({
      message: LIST_USER_EMAILS_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { userId: params.userId },
    });

    const user = await this.userRepository.findById(params.userId);
    if (!user) {
      this.logProvider.warn({
        message: LIST_USER_EMAILS_LOG_MESSAGES.USER_NOT_FOUND,
        context: this.logContext,
        meta: { userId: params.userId },
      });
      throw UserErrorFactory.notFound(params.userId);
    }

    const emails = await this.userEmailRepository.findByUserId(params.userId);

    this.logProvider.info({
      message: LIST_USER_EMAILS_LOG_MESSAGES.EMAILS_RETRIEVED,
      context: this.logContext,
      meta: { userId: params.userId, emailsCount: emails.length },
    });

    return emails;
  }
}
