import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';
import { TraceMethod } from '@adatechnology/shared';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { type ProviderRepositoryInterface } from '../../provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';

import { LIST_PROVIDERS_LOG_MESSAGES } from './list-providers.constants';
import {
  ListProvidersUseCaseInterface,
  ListProvidersUseCaseResponse,
} from './list-providers.interface';

@Injectable()
export class ListProvidersUseCase implements ListProvidersUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute(): Promise<ListProvidersUseCaseResponse> {
    this.logProvider.info({
      message: LIST_PROVIDERS_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
    });

    const providers = await this.providerRepository.listApproved();

    this.logProvider.info({
      message: LIST_PROVIDERS_LOG_MESSAGES.LISTED_SUCCESS,
      context: this.logContext,
      meta: { count: providers.length },
    });

    return providers;
  }
}
