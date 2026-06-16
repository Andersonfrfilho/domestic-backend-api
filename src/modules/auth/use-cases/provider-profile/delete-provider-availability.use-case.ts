import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';

import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { ProviderAvailabilityRepository } from '../../repositories/provider-availability.repository';

import type {
  DeleteProviderAvailabilityParams,
  DeleteProviderAvailabilityResult,
  DeleteProviderAvailabilityUseCaseInterface,
} from './types';

@Injectable()
export class DeleteProviderAvailabilityUseCase implements DeleteProviderAvailabilityUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
    private readonly availabilityRepository: ProviderAvailabilityRepository,
  ) {}

  @TraceMethod()
  async execute(
    params: DeleteProviderAvailabilityParams,
  ): Promise<DeleteProviderAvailabilityResult> {
    this.logProvider.info({
      message: 'Deleting provider availability',
      context: this.logContext,
      meta: { providerId: params.providerId, id: params.id },
    });

    try {
      const slot = await this.availabilityRepository.findById(params.id);

      if (!slot) {
        throw new NotFoundException('Horário de disponibilidade não encontrado');
      }

      if (slot.providerId !== params.providerId) {
        throw new ForbiddenException('Sem permissão para excluir este horário');
      }

      await this.availabilityRepository.deleteById(params.id);

      this.logProvider.info({
        message: 'Provider availability deleted successfully',
        context: this.logContext,
        meta: { id: params.id },
      });

      return { success: true };
    } catch (error) {
      this.logProvider.error({
        message: 'Failed to delete provider availability',
        context: this.logContext,
        meta: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }
}
