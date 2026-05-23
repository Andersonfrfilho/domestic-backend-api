import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';
import { TraceMethod } from '@adatechnology/logger';

import { type ServiceRepositoryInterface } from '@modules/service/service.repository.interface';
import { SERVICE_REPOSITORY_PROVIDE } from '@modules/service/service.token';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { LIST_SERVICES_LOG_MESSAGES } from './list-services.constants';
import {
  ListServicesUseCaseInterface,
  ListServicesUseCaseParams,
  ListServicesUseCaseResponse,
} from './list-services.interface';

@Injectable()
export class ListServicesUseCase implements ListServicesUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(SERVICE_REPOSITORY_PROVIDE)
    private readonly serviceRepository: ServiceRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute(params: ListServicesUseCaseParams): Promise<ListServicesUseCaseResponse> {
    this.logProvider.info({
      message: LIST_SERVICES_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { categoryId: params.categoryId ?? null },
    });

    const services = params.categoryId
      ? await this.serviceRepository.findByCategory(params.categoryId)
      : await this.serviceRepository.list();

    this.logProvider.info({
      message: LIST_SERVICES_LOG_MESSAGES.LISTED_SUCCESS,
      context: this.logContext,
      meta: { count: services.length, categoryId: params.categoryId ?? null },
    });

    return services;
  }
}
