import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';
import { TraceMethod } from '@adatechnology/logger';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { ProviderErrorFactory } from '../../factories/provider.error.factory';
import { type ProviderRepositoryInterface } from '../../provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';

import { REMOVE_WORK_LOCATION_LOG_MESSAGES } from './remove-work-location.constants';
import {
  RemoveWorkLocationUseCaseInterface,
  RemoveWorkLocationUseCaseParams,
} from './remove-work-location.interface';

@Injectable()
export class RemoveWorkLocationUseCase implements RemoveWorkLocationUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute(params: RemoveWorkLocationUseCaseParams): Promise<void> {
    this.logProvider.info({
      message: REMOVE_WORK_LOCATION_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { providerId: params.providerId, locationId: params.locationId },
    });

    const location = await this.providerRepository.findWorkLocation(
      params.providerId,
      params.locationId,
    );
    if (!location) {
      this.logProvider.warn({
        message: REMOVE_WORK_LOCATION_LOG_MESSAGES.LOCATION_NOT_FOUND,
        context: this.logContext,
        meta: { providerId: params.providerId, locationId: params.locationId },
      });
      throw ProviderErrorFactory.workLocationNotFound(params.locationId);
    }

    await this.providerRepository.removeWorkLocation(params.providerId, params.locationId);

    this.logProvider.info({
      message: REMOVE_WORK_LOCATION_LOG_MESSAGES.LOCATION_REMOVED,
      context: this.logContext,
      meta: { providerId: params.providerId, locationId: params.locationId },
    });
  }
}
