import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';
import { TraceMethod } from '@adatechnology/logger';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { UserErrorFactory } from '@modules/user/factories';
import { USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';

import { type UserRepositoryInterface } from '../../user.repository.interface';

import { DELETE_USER_LOG_MESSAGES } from './delete-user.constants';
import { DeleteUserUseCaseInterface, DeleteUserUseCaseParams } from './delete-user.interface';

@Injectable()
export class DeleteUserUseCase implements DeleteUserUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute(params: DeleteUserUseCaseParams): Promise<void> {
    this.logProvider.info({
      message: DELETE_USER_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: {
        userId: params.id,
      },
    });

    const user = await this.userRepository.findByIdWithDeleted(params.id);
    if (!user) {
      this.logProvider.warn({
        message: DELETE_USER_LOG_MESSAGES.USER_NOT_FOUND,
        context: this.logContext,
        meta: { userId: params.id },
      });
      throw UserErrorFactory.notFound(params.id);
    }

    if (user.deletedAt) {
      this.logProvider.warn({
        message: DELETE_USER_LOG_MESSAGES.USER_IS_DELETED,
        context: this.logContext,
        meta: { userId: params.id },
      });
      throw UserErrorFactory.accountDeleted(params.id);
    }

    await this.userRepository.update(params.id, { status: 'DELETED' });
    await this.userRepository.softDelete(params.id);

    this.logProvider.info({
      message: DELETE_USER_LOG_MESSAGES.USER_SOFT_DELETED,
      context: this.logContext,
      meta: {
        userId: params.id,
        previousStatus: user.status,
        currentStatus: 'DELETED',
      },
    });
  }
}
