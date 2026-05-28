import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable, BadRequestException } from '@nestjs/common';

import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { CategoryRepository } from '../../repositories/category.repository';
import { ProviderServiceRepository } from '../../repositories/provider-service.repository';

import type {
  CreateProviderServiceParams,
  CreateProviderServiceResult,
  CreateProviderServiceUseCaseInterface,
} from './types';

export const CREATE_PROVIDER_SERVICE_LOG_MESSAGES = {
  START_FLOW: 'Starting create provider service flow',
  VALIDATION_ERROR: 'Service validation failed',
  SUCCESS: 'Provider service created successfully',
  FAILURE: 'Failed to create provider service',
} as const;

@Injectable()
export class CreateProviderServiceUseCase implements CreateProviderServiceUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
    private readonly providerServiceRepository: ProviderServiceRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  @TraceMethod()
  async execute(params: CreateProviderServiceParams): Promise<CreateProviderServiceResult> {
    this.logProvider.info({
      message: CREATE_PROVIDER_SERVICE_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { providerId: params.providerId, serviceId: params.serviceId },
    });

    try {
      // Validate inputs
      if (params.estimatedDurationMinutes <= 0) {
        throw new BadRequestException('Duração estimada deve ser maior que 0');
      }

      if (params.pricePerHour <= 0) {
        throw new BadRequestException('Preço por hora deve ser maior que 0');
      }

      const providerService = await this.providerServiceRepository.create({
        providerId: params.providerId,
        serviceId: params.serviceId,
        estimatedDurationMinutes: params.estimatedDurationMinutes,
        pricePerHour: params.pricePerHour,
        priceBase: params.priceBase,
        priceType: params.priceType,
      });

      // Fetch related data
      const fetchedService = await this.providerServiceRepository.findById(providerService.id);

      this.logProvider.info({
        message: CREATE_PROVIDER_SERVICE_LOG_MESSAGES.SUCCESS,
        context: this.logContext,
        meta: { serviceId: providerService.id },
      });

      return {
        success: true,
        data: {
          id: fetchedService!.id,
          serviceId: fetchedService!.serviceId,
          categoryId: fetchedService!.service.categoryId,
          categoryName: fetchedService!.service.category.name,
          serviceName: fetchedService!.service.name,
          priceBase: fetchedService!.priceBase ? Number(fetchedService!.priceBase) : null,
          priceType: fetchedService!.priceType,
          estimatedDurationMinutes: fetchedService!.estimatedDurationMinutes,
          pricePerHour: fetchedService!.pricePerHour ? Number(fetchedService!.pricePerHour) : null,
          isActive: fetchedService!.isActive,
        },
      };
    } catch (error) {
      this.logProvider.error({
        message: CREATE_PROVIDER_SERVICE_LOG_MESSAGES.FAILURE,
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
