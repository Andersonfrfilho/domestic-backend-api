import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { CATEGORY_REPOSITORY_PROVIDE } from '@modules/category/category.token';
import { type CategoryRepositoryInterface } from '@modules/category/category.repository.interface';
import { SERVICE_REPOSITORY_PROVIDE } from '@modules/service/service.token';
import { type ServiceRepositoryInterface } from '@modules/service/service.repository.interface';
import { ServiceErrorFactory } from '@modules/service/factories/service.error.factory';

import { UPDATE_SERVICE_LOG_MESSAGES } from './update-service.constants';
import {
  UpdateServiceUseCaseInterface,
  UpdateServiceUseCaseParams,
  UpdateServiceUseCaseResponse,
} from './update-service.interface';

@Injectable()
export class UpdateServiceUseCase implements UpdateServiceUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(SERVICE_REPOSITORY_PROVIDE)
    private readonly serviceRepository: ServiceRepositoryInterface,
    @Inject(CATEGORY_REPOSITORY_PROVIDE)
    private readonly categoryRepository: CategoryRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: UpdateServiceUseCaseParams): Promise<UpdateServiceUseCaseResponse> {
    const { id, ...updateData } = params;

    this.logProvider.info({
      message: UPDATE_SERVICE_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { serviceId: id, fields: Object.keys(updateData) },
    });

    const existing = await this.serviceRepository.findById(id);
    if (!existing) {
      this.logProvider.warn({
        message: UPDATE_SERVICE_LOG_MESSAGES.SERVICE_NOT_FOUND,
        context: this.logContext,
        meta: { serviceId: id },
      });
      throw ServiceErrorFactory.notFound(id);
    }

    if (updateData.categoryId) {
      const category = await this.categoryRepository.findById(updateData.categoryId);
      if (!category) {
        this.logProvider.warn({
          message: UPDATE_SERVICE_LOG_MESSAGES.CATEGORY_NOT_FOUND,
          context: this.logContext,
          meta: { serviceId: id, categoryId: updateData.categoryId },
        });
        throw ServiceErrorFactory.categoryNotFound(updateData.categoryId);
      }
    }

    const updated = await this.serviceRepository.update(id, updateData);

    this.logProvider.info({
      message: UPDATE_SERVICE_LOG_MESSAGES.UPDATED_SUCCESS,
      context: this.logContext,
      meta: { serviceId: updated.id, categoryId: updated.categoryId },
    });

    return updated;
  }
}
