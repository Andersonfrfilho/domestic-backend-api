import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';
import { TraceMethod } from '@adatechnology/logger';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { ProviderErrorFactory } from '../../factories/provider.error.factory';
import { type ProviderRepositoryInterface } from '../../provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';

import { REMOVE_PROVIDER_SERVICE_LOG_MESSAGES } from './remove-provider-service.constants';
import {
  RemoveProviderServiceUseCaseInterface,
  RemoveProviderServiceUseCaseParams,
} from './remove-provider-service.interface';

@Injectable()
export class RemoveProviderServiceUseCase implements RemoveProviderServiceUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute(params: RemoveProviderServiceUseCaseParams): Promise<void> {
    this.logProvider.info({
      message: REMOVE_PROVIDER_SERVICE_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { providerId: params.providerId, serviceId: params.serviceId },
    });

    const provider = await this.providerRepository.findById(params.providerId);
    if (!provider) {
      this.logProvider.warn({
        message: REMOVE_PROVIDER_SERVICE_LOG_MESSAGES.PROVIDER_NOT_FOUND,
        context: this.logContext,
        meta: { providerId: params.providerId },
      });
      throw ProviderErrorFactory.notFound(params.providerId);
    }

    const link = await this.providerRepository.findProviderService(
      params.providerId,
      params.serviceId,
    );
    if (!link) {
      this.logProvider.warn({
        message: REMOVE_PROVIDER_SERVICE_LOG_MESSAGES.SERVICE_NOT_LINKED,
        context: this.logContext,
        meta: { providerId: params.providerId, serviceId: params.serviceId },
      });
      throw ProviderErrorFactory.serviceNotLinked(params.serviceId);
    }

    await this.providerRepository.removeService(params.providerId, params.serviceId);

    this.logProvider.info({
      message: REMOVE_PROVIDER_SERVICE_LOG_MESSAGES.SERVICE_REMOVED,
      context: this.logContext,
      meta: { providerId: params.providerId, serviceId: params.serviceId },
    });
  }
}
