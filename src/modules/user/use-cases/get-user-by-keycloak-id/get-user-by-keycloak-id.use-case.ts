import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { UserErrorFactory } from '@modules/user/factories';
import { USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';

import { type UserRepositoryInterface } from '../../user.repository.interface';

import { GET_USER_BY_KEYCLOAK_ID_LOG_MESSAGES } from './get-user-by-keycloak-id.constants';
import {
  GetUserByKeycloakIdUseCaseInterface,
  GetUserByKeycloakIdUseCaseParams,
  GetUserByKeycloakIdUseCaseResponse,
} from './get-user-by-keycloak-id.interface';

@Injectable()
export class GetUserByKeycloakIdUseCase implements GetUserByKeycloakIdUseCaseInterface {
  @TraceMethod()
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(
    params: GetUserByKeycloakIdUseCaseParams,
  ): Promise<GetUserByKeycloakIdUseCaseResponse> {
    this.logProvider.info({
      message: GET_USER_BY_KEYCLOAK_ID_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: {
        keycloakId: params.keycloakId,
      },
    });

    const user = await this.userRepository.findByKeycloakIdWithDeleted(params.keycloakId);
    if (!user) {
      this.logProvider.warn({
        message: GET_USER_BY_KEYCLOAK_ID_LOG_MESSAGES.USER_NOT_FOUND,
        context: this.logContext,
        meta: { keycloakId: params.keycloakId },
      });
      throw UserErrorFactory.notFound(params.keycloakId);
    }

    if (user.deletedAt) {
      this.logProvider.warn({
        message: GET_USER_BY_KEYCLOAK_ID_LOG_MESSAGES.USER_IS_DELETED,
        context: this.logContext,
        meta: { userId: user.id, keycloakId: params.keycloakId },
      });
      throw UserErrorFactory.accountDeleted(user.id);
    }

    this.logProvider.info({
      message: GET_USER_BY_KEYCLOAK_ID_LOG_MESSAGES.USER_FOUND,
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
