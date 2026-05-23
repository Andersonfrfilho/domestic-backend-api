import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';
import { TraceMethod } from '@adatechnology/shared';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { ProviderErrorFactory } from '../../factories/provider.error.factory';
import { type ProviderRepositoryInterface } from '../../provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';

import { GET_PROVIDER_BY_ID_LOG_MESSAGES } from './get-provider-by-id.constants';
import {
  GetProviderByIdUseCaseInterface,
  GetProviderByIdUseCaseParams,
  GetProviderByIdUseCaseResponse,
} from './get-provider-by-id.interface';

@Injectable()
export class GetProviderByIdUseCase implements GetProviderByIdUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute(params: GetProviderByIdUseCaseParams): Promise<GetProviderByIdUseCaseResponse> {
    this.logProvider.info({
      message: GET_PROVIDER_BY_ID_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { providerId: params.id },
    });

    const provider = await this.providerRepository.findById(params.id);
    if (!provider) {
      this.logProvider.warn({
        message: GET_PROVIDER_BY_ID_LOG_MESSAGES.PROVIDER_NOT_FOUND,
        context: this.logContext,
        meta: { providerId: params.id },
      });
      throw ProviderErrorFactory.notFound(params.id);
    }

    this.logProvider.info({
      message: GET_PROVIDER_BY_ID_LOG_MESSAGES.PROVIDER_FOUND,
      context: this.logContext,
      meta: { providerId: provider.id, userId: provider.userId },
    });

    return provider;
  }
}
