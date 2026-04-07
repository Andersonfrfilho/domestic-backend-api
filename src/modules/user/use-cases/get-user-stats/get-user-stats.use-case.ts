import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { type UserRepositoryInterface } from '../../user.repository.interface';
import { USER_REPOSITORY_PROVIDE } from '../../user.token';

import {
  GetUserStatsUseCaseInterface,
  GetUserStatsUseCaseResponse,
} from './get-user-stats.interface';
import {
  GET_USER_STATS_LOG_CONTEXT,
  GET_USER_STATS_LOG_MESSAGES,
} from './get-user-stats.constants';

@Injectable()
export class GetUserStatsUseCase implements GetUserStatsUseCaseInterface {
  private readonly logContext = GET_USER_STATS_LOG_CONTEXT;

  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(): Promise<GetUserStatsUseCaseResponse> {
    this.logProvider.info({
      message: GET_USER_STATS_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: {
        route: '/v1/users/admin/stats',
      },
    });

    const stats = await this.userRepository.getStats();

    this.logProvider.info({
      message: GET_USER_STATS_LOG_MESSAGES.STATS_RETRIEVED,
      context: this.logContext,
      meta: {
        totalUsers: stats.totalUsers,
        customers: stats.customers,
        providers: stats.providers,
      },
    });

    return stats;
  }
}
