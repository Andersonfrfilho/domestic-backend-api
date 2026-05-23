import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';
import { TraceMethod } from '@adatechnology/logger';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { UserErrorFactory } from '@modules/user/factories';
import { USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';

import { type UserRepositoryInterface } from '../../user.repository.interface';

import { GET_USER_BY_ID_LOG_MESSAGES } from './get-user-by-id.constants';
import {
  GetUserByIdUseCaseInterface,
  GetUserByIdUseCaseParams,
  GetUserByIdUseCaseResponse,
} from './get-user-by-id.interface';

@Injectable()
export class GetUserByIdUseCase implements GetUserByIdUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute(params: GetUserByIdUseCaseParams): Promise<GetUserByIdUseCaseResponse> {
    this.logProvider.info({
      message: GET_USER_BY_ID_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: {
        userId: params.id,
      },
    });

    const user = await this.userRepository.findByIdWithDeleted(params.id);
    if (!user) {
      this.logProvider.warn({
        message: GET_USER_BY_ID_LOG_MESSAGES.USER_NOT_FOUND,
        context: this.logContext,
        meta: { userId: params.id },
      });
      throw UserErrorFactory.notFound(params.id);
    }

    if (user.deletedAt) {
      this.logProvider.warn({
        message: GET_USER_BY_ID_LOG_MESSAGES.USER_IS_DELETED,
        context: this.logContext,
        meta: { userId: params.id },
      });
      throw UserErrorFactory.accountDeleted(params.id);
    }

    this.logProvider.info({
      message: GET_USER_BY_ID_LOG_MESSAGES.USER_FOUND,
      context: this.logContext,
      meta: {
        userId: user.id,
        keycloakId: user.keycloakId,
        status: user.status,
      },
    });

    return user;
  }
}
