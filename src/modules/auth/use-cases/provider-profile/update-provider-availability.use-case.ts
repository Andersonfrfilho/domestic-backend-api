import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';

import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { ProviderAvailabilityRepository } from '../../repositories/provider-availability.repository';

import type {
  UpdateProviderAvailabilityParams,
  UpdateProviderAvailabilityResult,
  UpdateProviderAvailabilityUseCaseInterface,
} from './types';

@Injectable()
export class UpdateProviderAvailabilityUseCase implements UpdateProviderAvailabilityUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
    private readonly availabilityRepository: ProviderAvailabilityRepository,
  ) {}

  @TraceMethod()
  async execute(
    params: UpdateProviderAvailabilityParams,
  ): Promise<UpdateProviderAvailabilityResult> {
    this.logProvider.info({
      message: 'Updating provider availability',
      context: this.logContext,
      meta: { providerId: params.providerId, dayOfWeek: params.dayOfWeek },
    });

    try {
      if (params.dayOfWeek < 0 || params.dayOfWeek > 6) {
        throw new BadRequestException('Dia da semana inválido (0-6)');
      }

      if (!this.isValidTime(params.startTime) || !this.isValidTime(params.endTime)) {
        throw new BadRequestException('Formato de hora inválido (HH:mm)');
      }

      const [startHour, startMin] = params.startTime.split(':').map(Number);
      const [endHour, endMin] = params.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (startMinutes >= endMinutes) {
        throw new BadRequestException('Hora de início deve ser menor que hora de término');
      }

      const current = await this.availabilityRepository.findByProviderIdAndDay(
        params.providerId,
        params.dayOfWeek,
      );

      if (!current) {
        throw new NotFoundException('Horário de disponibilidade não encontrado');
      }

      const updated = await this.availabilityRepository.update(current.id, {
        startTime: params.startTime,
        endTime: params.endTime,
      });

      this.logProvider.info({
        message: 'Provider availability updated successfully',
        context: this.logContext,
        meta: { availabilityId: current.id },
      });

      return {
        success: true,
        data: {
          id: updated!.id,
          dayOfWeek: updated!.dayOfWeek,
          startTime: updated!.startTime,
          endTime: updated!.endTime,
          isActive: updated!.isActive,
        },
      };
    } catch (error) {
      this.logProvider.error({
        message: 'Failed to update provider availability',
        context: this.logContext,
        meta: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }

  private isValidTime(time: string): boolean {
    const regex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(time);
  }
}
