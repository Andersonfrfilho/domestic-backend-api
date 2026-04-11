import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { type ProviderRepositoryInterface } from '../../provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';
import { ProviderErrorFactory } from '../../factories/provider.error.factory';

import { UPDATE_PROVIDER_LOG_MESSAGES } from './update-provider.constants';
import {
  UpdateProviderUseCaseInterface,
  UpdateProviderUseCaseParams,
  UpdateProviderUseCaseResponse,
} from './update-provider.interface';

@Injectable()
export class UpdateProviderUseCase implements UpdateProviderUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: UpdateProviderUseCaseParams): Promise<UpdateProviderUseCaseResponse> {
    const { id, ...updateParams } = params;

    this.logProvider.info({
      message: UPDATE_PROVIDER_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { providerId: id, fields: Object.keys(updateParams) },
    });

    const existing = await this.providerRepository.findById(id);
    if (!existing) {
      this.logProvider.warn({
        message: UPDATE_PROVIDER_LOG_MESSAGES.PROVIDER_NOT_FOUND,
        context: this.logContext,
        meta: { providerId: id },
      });
      throw ProviderErrorFactory.notFound(id);
    }

    const updated = await this.providerRepository.update(id, updateParams);

    this.logProvider.info({
      message: UPDATE_PROVIDER_LOG_MESSAGES.UPDATED_SUCCESS,
      context: this.logContext,
      meta: { providerId: updated.id, userId: updated.userId },
    });

    return updated;
  }
}
