import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable } from '@nestjs/common';

import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { ProviderServiceRepository } from '../../repositories/provider-service.repository';

import type {
  GetProviderServicesParams,
  GetProviderServicesResult,
  GetProviderServicesUseCaseInterface,
} from './types';

export const GET_PROVIDER_SERVICES_LOG_MESSAGES = {
  START_FLOW: 'Starting get provider services flow',
  SUCCESS: 'Provider services retrieved successfully',
} as const;

@Injectable()
export class GetProviderServicesUseCase implements GetProviderServicesUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
    private readonly providerServiceRepository: ProviderServiceRepository,
  ) {}

  @TraceMethod()
  async execute(params: GetProviderServicesParams): Promise<GetProviderServicesResult> {
    this.logProvider.info({
      message: GET_PROVIDER_SERVICES_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { providerId: params.providerId },
    });

    try {
      const services = await this.providerServiceRepository.findByProviderId(params.providerId);

      this.logProvider.info({
        message: GET_PROVIDER_SERVICES_LOG_MESSAGES.SUCCESS,
        context: this.logContext,
        meta: { providerId: params.providerId, count: services.length },
      });

      return {
        success: true,
        data: services.map((svc) => ({
          id: svc.id,
          serviceId: svc.serviceId,
          categoryId: svc.service.categoryId,
          categoryName: svc.service.category.name,
          serviceName: svc.service.name,
          priceBase: svc.priceBase ? Number(svc.priceBase) : null,
          priceType: svc.priceType,
          estimatedDurationMinutes: svc.estimatedDurationMinutes,
          pricePerHour: svc.pricePerHour ? Number(svc.pricePerHour) : null,
          isActive: svc.isActive,
        })),
      };
    } catch (error) {
      this.logProvider.error({
        message: 'Failed to get provider services',
        context: this.logContext,
        meta: {
          providerId: params.providerId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }
}
