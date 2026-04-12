import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { UserErrorFactory } from '@modules/user/factories';
import { USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';
import { type UserRepositoryInterface } from '@modules/user/user.repository.interface';

import { EmailErrorFactory } from '../../factories/email.error.factory';
import { type EmailRepositoryInterface } from '../../email.repository.interface';
import { type UserEmailRepositoryInterface } from '../../user-email.repository.interface';
import {
  EMAIL_REPOSITORY_PROVIDE,
  USER_EMAIL_REPOSITORY_PROVIDE,
} from '../../email.token';

import { ADD_USER_EMAIL_LOG_MESSAGES } from './add-user-email.constants';
import {
  AddUserEmailUseCaseInterface,
  AddUserEmailUseCaseParams,
  AddUserEmailUseCaseResponse,
} from './add-user-email.interface';

@Injectable()
export class AddUserEmailUseCase implements AddUserEmailUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(EMAIL_REPOSITORY_PROVIDE)
    private readonly emailRepository: EmailRepositoryInterface,
    @Inject(USER_EMAIL_REPOSITORY_PROVIDE)
    private readonly userEmailRepository: UserEmailRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: AddUserEmailUseCaseParams): Promise<AddUserEmailUseCaseResponse> {
    this.logProvider.info({
      message: ADD_USER_EMAIL_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { userId: params.userId, label: params.label },
    });

    const user = await this.userRepository.findById(params.userId);
    if (!user) {
      this.logProvider.warn({
        message: ADD_USER_EMAIL_LOG_MESSAGES.USER_NOT_FOUND,
        context: this.logContext,
        meta: { userId: params.userId },
      });
      throw UserErrorFactory.notFound(params.userId);
    }

    let email = await this.emailRepository.findByEmail(params.email);

    if (email) {
      const existing = await this.userEmailRepository.findByUserIdAndEmailId(params.userId, email.id);
      if (existing) {
        this.logProvider.warn({
          message: ADD_USER_EMAIL_LOG_MESSAGES.EMAIL_ALREADY_EXISTS,
          context: this.logContext,
          meta: { userId: params.userId, email: params.email },
        });
        throw EmailErrorFactory.alreadyExists(params.email);
      }
    } else {
      email = await this.emailRepository.create({ email: params.email });
      this.logProvider.info({
        message: ADD_USER_EMAIL_LOG_MESSAGES.EMAIL_CREATED,
        context: this.logContext,
        meta: { emailId: email.id, email: params.email },
      });
    }

    const userEmail = await this.userEmailRepository.create({
      userId: params.userId,
      emailId: email.id,
      label: params.label,
      isPrimary: params.isPrimary ?? false,
    });

    this.logProvider.info({
      message: ADD_USER_EMAIL_LOG_MESSAGES.USER_EMAIL_LINKED,
      context: this.logContext,
      meta: { userEmailId: userEmail.id, userId: params.userId, emailId: email.id },
    });

    return userEmail;
  }
}
