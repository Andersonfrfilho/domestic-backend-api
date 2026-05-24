import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import { Inject, Injectable } from '@nestjs/common';

import { type CategoryRepositoryInterface } from '@modules/category/category.repository.interface';
import { CATEGORY_REPOSITORY_PROVIDE } from '@modules/category/category.token';
import { ServiceErrorFactory } from '@modules/service/factories/service.error.factory';
import { type ServiceRepositoryInterface } from '@modules/service/service.repository.interface';
import { SERVICE_REPOSITORY_PROVIDE } from '@modules/service/service.token';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { CREATE_SERVICE_LOG_MESSAGES } from './create-service.constants';
import {
  CreateServiceUseCaseInterface,
  CreateServiceUseCaseParams,
  CreateServiceUseCaseResponse,
} from './create-service.interface';

@Injectable()
export class CreateServiceUseCase implements CreateServiceUseCaseInterface {
  @TraceMethod()
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(SERVICE_REPOSITORY_PROVIDE)
    private readonly serviceRepository: ServiceRepositoryInterface,
    @Inject(CATEGORY_REPOSITORY_PROVIDE)
    private readonly categoryRepository: CategoryRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: CreateServiceUseCaseParams): Promise<CreateServiceUseCaseResponse> {
    this.logProvider.info({
      message: CREATE_SERVICE_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { categoryId: params.categoryId, name: params.name },
    });

    const category = await this.categoryRepository.findById(params.categoryId);
    if (!category) {
      this.logProvider.warn({
        message: CREATE_SERVICE_LOG_MESSAGES.CATEGORY_NOT_FOUND,
        context: this.logContext,
        meta: { categoryId: params.categoryId },
      });
      throw ServiceErrorFactory.categoryNotFound(params.categoryId);
    }

    const service = await this.serviceRepository.create(params);

    this.logProvider.info({
      message: CREATE_SERVICE_LOG_MESSAGES.CREATED_SUCCESS,
      context: this.logContext,
      meta: { serviceId: service.id, categoryId: service.categoryId },
    });

    return service;
  }
}
