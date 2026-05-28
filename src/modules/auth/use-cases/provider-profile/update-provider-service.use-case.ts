import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';

import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { ProviderServiceRepository } from '../../repositories/provider-service.repository';

import type {
  UpdateProviderServiceParams,
  UpdateProviderServiceResult,
  UpdateProviderServiceUseCaseInterface,
} from './types';

@Injectable()
export class UpdateProviderServiceUseCase implements UpdateProviderServiceUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
    private readonly providerServiceRepository: ProviderServiceRepository,
  ) {}

  @TraceMethod()
  async execute(params: UpdateProviderServiceParams): Promise<UpdateProviderServiceResult> {
    this.logProvider.info({
      message: 'Updating provider service',
      context: this.logContext,
      meta: { providerId: params.providerId, serviceId: params.serviceId },
    });

    try {
      if (params.estimatedDurationMinutes !== undefined && params.estimatedDurationMinutes <= 0) {
        throw new BadRequestException('Duração estimada deve ser maior que 0');
      }

      if (params.pricePerHour !== undefined && params.pricePerHour <= 0) {
        throw new BadRequestException('Preço por hora deve ser maior que 0');
      }

      const current = await this.providerServiceRepository.findById(params.serviceId);
      if (!current || current.providerId !== params.providerId) {
        throw new NotFoundException('Serviço não encontrado');
      }

      const updated = await this.providerServiceRepository.update(params.serviceId, {
        estimatedDurationMinutes: params.estimatedDurationMinutes,
        pricePerHour: params.pricePerHour,
        priceBase: params.priceBase,
        priceType: params.priceType,
        isActive: params.isActive,
      });

      this.logProvider.info({
        message: 'Provider service updated successfully',
        context: this.logContext,
        meta: { serviceId: params.serviceId },
      });

      return {
        success: true,
        data: {
          id: updated!.id,
          serviceId: updated!.serviceId,
          categoryId: updated!.service.categoryId,
          categoryName: updated!.service.category.name,
          serviceName: updated!.service.name,
          priceBase: updated!.priceBase ? Number(updated!.priceBase) : null,
          priceType: updated!.priceType,
          estimatedDurationMinutes: updated!.estimatedDurationMinutes,
          pricePerHour: updated!.pricePerHour ? Number(updated!.pricePerHour) : null,
          isActive: updated!.isActive,
        },
      };
    } catch (error) {
      this.logProvider.error({
        message: 'Failed to update provider service',
        context: this.logContext,
        meta: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }
}
