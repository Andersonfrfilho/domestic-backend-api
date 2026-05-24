import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { User } from '@modules/shared/providers/database/entities/user.entity';
import { UserErrorFactory } from '@modules/user/factories';

import { type UserRepositoryInterface } from '../../user.repository.interface';
import { USER_REPOSITORY_PROVIDE } from '../../user.token';

import { RESTORE_USER_LOG_MESSAGES } from './restore-user.constants';
import { RestoreUserUseCaseInterface, RestoreUserUseCaseParams } from './restore-user.interface';

@Injectable()
export class RestoreUserUseCase implements RestoreUserUseCaseInterface {
  @TraceMethod()
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: RestoreUserUseCaseParams): Promise<User> {
    this.logProvider.info({
      message: RESTORE_USER_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { userId: params.id },
    });

    const user = await this.userRepository.findByIdWithDeleted(params.id);

    if (!user) throw UserErrorFactory.notFound(params.id);

    if (!user.deletedAt) {
      this.logProvider.warn({
        message: RESTORE_USER_LOG_MESSAGES.USER_NOT_DELETED,
        context: this.logContext,
        meta: { userId: params.id },
      });
      throw UserErrorFactory.userNotDeleted(params.id);
    }

    await this.userRepository.restore(user.id);
    const restored = await this.userRepository.update(user.id, { status: 'ACTIVE' });

    this.logProvider.info({
      message: RESTORE_USER_LOG_MESSAGES.RESTORED_SUCCESS,
      context: this.logContext,
      meta: { userId: restored.id, keycloakId: restored.keycloakId },
    });

    return restored;
  }
}
