import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { UserErrorFactory } from '@modules/user/factories';
import { USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';

import { type UserRepositoryInterface } from '../../user.repository.interface';

import {
  GET_USER_BY_ID_LOG_CONTEXT,
  GET_USER_BY_ID_LOG_MESSAGES,
} from './get-user-by-id.constants';
import {
  GetUserByIdUseCaseInterface,
  GetUserByIdUseCaseParams,
  GetUserByIdUseCaseResponse,
} from './get-user-by-id.interface';

@Injectable()
export class GetUserByIdUseCase implements GetUserByIdUseCaseInterface {
  private readonly logContext = GET_USER_BY_ID_LOG_CONTEXT;

  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: GetUserByIdUseCaseParams): Promise<GetUserByIdUseCaseResponse> {
    this.logProvider.info({
      message: GET_USER_BY_ID_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: {
        userId: params.id,
      },
    });

    const user = await this.userRepository.findById(params.id);
    if (!user) {
      this.logProvider.warn({
        message: GET_USER_BY_ID_LOG_MESSAGES.USER_NOT_FOUND,
        context: this.logContext,
        meta: {
          userId: params.id,
        },
      });
      throw UserErrorFactory.notFound(params.id);
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
