import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable } from '@nestjs/common';

import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { ProviderAvailabilityRepository } from '../../repositories/provider-availability.repository';

import type {
  GetProviderAvailabilityParams,
  GetProviderAvailabilityResult,
  GetProviderAvailabilityUseCaseInterface,
} from './types';

@Injectable()
export class GetProviderAvailabilityUseCase implements GetProviderAvailabilityUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
    private readonly availabilityRepository: ProviderAvailabilityRepository,
  ) {}

  @TraceMethod()
  async execute(params: GetProviderAvailabilityParams): Promise<GetProviderAvailabilityResult> {
    this.logProvider.info({
      message: 'Getting provider availability',
      context: this.logContext,
      meta: { providerId: params.providerId },
    });

    try {
      const availability = await this.availabilityRepository.findByProviderId(params.providerId);

      this.logProvider.info({
        message: 'Provider availability retrieved successfully',
        context: this.logContext,
        meta: { providerId: params.providerId, count: availability.length },
      });

      return {
        success: true,
        data: availability.map((avail) => ({
          id: avail.id,
          dayOfWeek: avail.dayOfWeek,
          startTime: avail.startTime,
          endTime: avail.endTime,
          isActive: avail.isActive,
          additionalPercentage: avail.additionalPercentage,
        })),
      };
    } catch (error) {
      this.logProvider.error({
        message: 'Failed to get provider availability',
        context: this.logContext,
        meta: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }
}
