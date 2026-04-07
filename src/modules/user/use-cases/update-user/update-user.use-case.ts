import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { UserErrorFactory } from '@modules/user/factories';
import { USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';

import { type UserRepositoryInterface } from '../../user.repository.interface';

import { UPDATE_USER_LOG_CONTEXT, UPDATE_USER_LOG_MESSAGES } from './update-user.constants';
import {
  UpdateUserUseCaseInterface,
  UpdateUserUseCaseParams,
  UpdateUserUseCaseResponse,
} from './update-user.interface';

@Injectable()
export class UpdateUserUseCase implements UpdateUserUseCaseInterface {
  private readonly logContext = UPDATE_USER_LOG_CONTEXT;

  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: UpdateUserUseCaseParams): Promise<UpdateUserUseCaseResponse> {
    this.logProvider.info({
      message: UPDATE_USER_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: {
        userId: params.id,
        fullName: params.fullName,
        status: params.status,
      },
    });

    const user = await this.userRepository.findById(params.id);
    if (!user) {
      this.logProvider.warn({
        message: UPDATE_USER_LOG_MESSAGES.USER_NOT_FOUND,
        context: this.logContext,
        meta: {
          userId: params.id,
        },
      });
      throw UserErrorFactory.notFound(params.id);
    }

    const updatedUser = await this.userRepository.update(params.id, {
      fullName: params.fullName,
      status: params.status,
    });

    this.logProvider.info({
      message: UPDATE_USER_LOG_MESSAGES.USER_UPDATED,
      context: this.logContext,
      meta: {
        userId: updatedUser.id,
        keycloakId: updatedUser.keycloakId,
        status: updatedUser.status,
      },
    });

    return updatedUser;
  }
}
