import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';
import { TraceMethod } from '@adatechnology/shared';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { type ProviderRepositoryInterface } from '../../provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';

import { LIST_PENDING_PROVIDERS_LOG_MESSAGES } from './list-pending-providers.constants';
import {
  ListPendingProvidersUseCaseInterface,
  ListPendingProvidersUseCaseResponse,
} from './list-pending-providers.interface';

@Injectable()
export class ListPendingProvidersUseCase implements ListPendingProvidersUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute(): Promise<ListPendingProvidersUseCaseResponse> {
    this.logProvider.info({
      message: LIST_PENDING_PROVIDERS_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
    });

    const providers = await this.providerRepository.listUnderReview();

    this.logProvider.info({
      message: LIST_PENDING_PROVIDERS_LOG_MESSAGES.LISTED_SUCCESS,
      context: this.logContext,
      meta: { count: providers.length },
    });

    return providers;
  }
}
