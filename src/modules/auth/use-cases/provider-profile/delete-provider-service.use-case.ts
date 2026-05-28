import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { ProviderServiceRepository } from '../../repositories/provider-service.repository';

import type {
  DeleteProviderServiceParams,
  DeleteProviderServiceResult,
  DeleteProviderServiceUseCaseInterface,
} from './types';

@Injectable()
export class DeleteProviderServiceUseCase implements DeleteProviderServiceUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
    private readonly providerServiceRepository: ProviderServiceRepository,
  ) {}

  @TraceMethod()
  async execute(params: DeleteProviderServiceParams): Promise<DeleteProviderServiceResult> {
    this.logProvider.info({
      message: 'Deleting provider service',
      context: this.logContext,
      meta: { providerId: params.providerId, serviceId: params.serviceId },
    });

    try {
      const current = await this.providerServiceRepository.findById(params.serviceId);
      if (!current || current.providerId !== params.providerId) {
        throw new NotFoundException('Serviço não encontrado');
      }

      await this.providerServiceRepository.softDelete(params.serviceId);

      this.logProvider.info({
        message: 'Provider service deleted successfully',
        context: this.logContext,
        meta: { serviceId: params.serviceId },
      });

      return { success: true };
    } catch (error) {
      this.logProvider.error({
        message: 'Failed to delete provider service',
        context: this.logContext,
        meta: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }
}
