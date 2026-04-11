import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { SERVICE_REPOSITORY_PROVIDE } from '@modules/service/service.token';
import { type ServiceRepositoryInterface } from '@modules/service/service.repository.interface';
import { ServiceErrorFactory } from '@modules/service/factories/service.error.factory';

import { GET_SERVICE_BY_ID_LOG_MESSAGES } from './get-service-by-id.constants';
import {
  GetServiceByIdUseCaseInterface,
  GetServiceByIdUseCaseParams,
  GetServiceByIdUseCaseResponse,
} from './get-service-by-id.interface';

@Injectable()
export class GetServiceByIdUseCase implements GetServiceByIdUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(SERVICE_REPOSITORY_PROVIDE)
    private readonly serviceRepository: ServiceRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: GetServiceByIdUseCaseParams): Promise<GetServiceByIdUseCaseResponse> {
    this.logProvider.info({
      message: GET_SERVICE_BY_ID_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { serviceId: params.id },
    });

    const service = await this.serviceRepository.findById(params.id);
    if (!service) {
      this.logProvider.warn({
        message: GET_SERVICE_BY_ID_LOG_MESSAGES.SERVICE_NOT_FOUND,
        context: this.logContext,
        meta: { serviceId: params.id },
      });
      throw ServiceErrorFactory.notFound(params.id);
    }

    this.logProvider.info({
      message: GET_SERVICE_BY_ID_LOG_MESSAGES.SERVICE_FOUND,
      context: this.logContext,
      meta: { serviceId: service.id, categoryId: service.categoryId },
    });

    return service;
  }
}
