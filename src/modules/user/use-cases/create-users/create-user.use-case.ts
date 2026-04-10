import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { UserErrorFactory } from '@modules/user/factories';

import { type UserRepositoryInterface } from '../../user.repository.interface';
import { USER_REPOSITORY_PROVIDE } from '../../user.token';

import { CREATE_USER_LOG_CONTEXT, CREATE_USER_LOG_MESSAGES } from './create-user.constants';
import {
  UserCreateUseCaseInterface,
  UserCreateUseCaseParams,
  UserCreateUseCaseResponse,
} from './create-user.interface';

@Injectable()
export class UserApplicationCreateUseCase implements UserCreateUseCaseInterface {
  private readonly logContext = CREATE_USER_LOG_CONTEXT;

  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: UserCreateUseCaseParams): Promise<UserCreateUseCaseResponse> {
    this.logProvider.info({
      message: CREATE_USER_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: {
        fullName: params.fullName,
        keycloakId: params.keycloakId,
        status: params.status,
        hasKeycloakId: Boolean(params.keycloakId),
      },
    });

    // Validate keycloak_id uniqueness if provided (including soft-deleted records)
    if (params.keycloakId) {
      const existingUser = await this.userRepository.findByKeycloakIdWithDeleted(params.keycloakId);

      if (existingUser?.deletedAt) {
        this.logProvider.warn({
          message: CREATE_USER_LOG_MESSAGES.KEYCLOAK_ID_BELONGS_TO_DELETED_USER,
          context: this.logContext,
          meta: { keycloakId: params.keycloakId, userId: existingUser.id },
        });
        throw UserErrorFactory.accountDeleted(existingUser.id);
      }

      if (existingUser) {
        this.logProvider.warn({
          message: CREATE_USER_LOG_MESSAGES.DUPLICATE_KEYCLOAK_ID,
          context: this.logContext,
          meta: { keycloakId: params.keycloakId, existingUserId: existingUser.id },
        });
        throw UserErrorFactory.duplicateKeycloakId(params.keycloakId);
      }
    }

    const user = await this.userRepository.create({
      fullName: params.fullName,
      keycloakId: params.keycloakId,
      status: params.status,
    });

    this.logProvider.info({
      message: CREATE_USER_LOG_MESSAGES.CREATED_SUCCESS,
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
