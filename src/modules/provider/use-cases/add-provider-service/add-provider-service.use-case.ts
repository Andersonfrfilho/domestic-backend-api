import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';
import { TraceMethod } from '@adatechnology/logger';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { ProviderErrorFactory } from '../../factories/provider.error.factory';
import { type ProviderRepositoryInterface } from '../../provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';

import { ADD_PROVIDER_SERVICE_LOG_MESSAGES } from './add-provider-service.constants';
import {
  AddProviderServiceUseCaseInterface,
  AddProviderServiceUseCaseParams,
  AddProviderServiceUseCaseResponse,
} from './add-provider-service.interface';

@Injectable()
export class AddProviderServiceUseCase implements AddProviderServiceUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute(
    params: AddProviderServiceUseCaseParams,
  ): Promise<AddProviderServiceUseCaseResponse> {
    this.logProvider.info({
      message: ADD_PROVIDER_SERVICE_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { providerId: params.providerId, serviceId: params.serviceId },
    });

    const provider = await this.providerRepository.findById(params.providerId);
    if (!provider) {
      this.logProvider.warn({
        message: ADD_PROVIDER_SERVICE_LOG_MESSAGES.PROVIDER_NOT_FOUND,
        context: this.logContext,
        meta: { providerId: params.providerId },
      });
      throw ProviderErrorFactory.notFound(params.providerId);
    }

    const existing = await this.providerRepository.findProviderService(
      params.providerId,
      params.serviceId,
    );
    if (existing) {
      this.logProvider.warn({
        message: ADD_PROVIDER_SERVICE_LOG_MESSAGES.SERVICE_ALREADY_LINKED,
        context: this.logContext,
        meta: { providerId: params.providerId, serviceId: params.serviceId },
      });
      throw ProviderErrorFactory.serviceAlreadyLinked(params.serviceId);
    }

    const linked = await this.providerRepository.addService(params);

    this.logProvider.info({
      message: ADD_PROVIDER_SERVICE_LOG_MESSAGES.SERVICE_LINKED,
      context: this.logContext,
      meta: { providerId: params.providerId, serviceId: params.serviceId },
    });

    return linked;
  }
}
