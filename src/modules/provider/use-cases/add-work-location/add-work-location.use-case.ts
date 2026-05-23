import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { ProviderErrorFactory } from '../../factories/provider.error.factory';
import { type ProviderRepositoryInterface } from '../../provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';

import { ADD_WORK_LOCATION_LOG_MESSAGES } from './add-work-location.constants';
import {
  AddWorkLocationUseCaseInterface,
  AddWorkLocationUseCaseParams,
  AddWorkLocationUseCaseResponse,
} from './add-work-location.interface';

@Injectable()
export class AddWorkLocationUseCase implements AddWorkLocationUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: AddWorkLocationUseCaseParams): Promise<AddWorkLocationUseCaseResponse> {
    this.logProvider.info({
      message: ADD_WORK_LOCATION_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { providerId: params.providerId },
    });

    const provider = await this.providerRepository.findById(params.providerId);
    if (!provider) {
      this.logProvider.warn({
        message: ADD_WORK_LOCATION_LOG_MESSAGES.PROVIDER_NOT_FOUND,
        context: this.logContext,
        meta: { providerId: params.providerId },
      });
      throw ProviderErrorFactory.notFound(params.providerId);
    }

    const location = await this.providerRepository.addWorkLocation(params);

    this.logProvider.info({
      message: ADD_WORK_LOCATION_LOG_MESSAGES.LOCATION_ADDED,
      context: this.logContext,
      meta: { providerId: params.providerId, locationId: location.id },
    });

    return location;
  }
}
