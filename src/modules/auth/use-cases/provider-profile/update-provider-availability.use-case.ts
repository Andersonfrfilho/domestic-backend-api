import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

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
      meta: { providerId: params.providerId, id: params.id },
    });

    try {
      if (!this.isValidTime(params.startTime) || !this.isValidTime(params.endTime)) {
        throw new BadRequestException('Formato de hora inválido (HH:mm)');
      }

      const startMin = this.toMinutes(params.startTime);
      const endMin = this.toMinutes(params.endTime);

      if (startMin >= endMin) {
        throw new BadRequestException('Hora de início deve ser menor que hora de término');
      }

      const current = await this.availabilityRepository.findById(params.id);

      if (!current) {
        throw new NotFoundException('Horário de disponibilidade não encontrado');
      }

      if (current.providerId !== params.providerId) {
        throw new ForbiddenException('Sem permissão para atualizar este horário');
      }

      const siblings = await this.availabilityRepository.findByProviderIdAndDay(
        params.providerId,
        current.dayOfWeek,
      );

      for (const slot of siblings) {
        if (slot.id === params.id) continue;
        const slotStart = this.toMinutes(slot.startTime.substring(0, 5));
        const slotEnd = this.toMinutes(slot.endTime.substring(0, 5));
        if (startMin < slotEnd && endMin > slotStart) {
          throw new ConflictException('Horário conflita com uma faixa já cadastrada');
        }
      }

      const updated = await this.availabilityRepository.update(params.id, {
        startTime: params.startTime,
        endTime: params.endTime,
        ...(params.additionalPercentage !== undefined && {
          additionalPercentage: params.additionalPercentage,
        }),
      });

      this.logProvider.info({
        message: 'Provider availability updated successfully',
        context: this.logContext,
        meta: { availabilityId: params.id },
      });

      return {
        success: true,
        data: {
          id: updated!.id,
          dayOfWeek: updated!.dayOfWeek,
          startTime: updated!.startTime,
          endTime: updated!.endTime,
          isActive: updated!.isActive,
          additionalPercentage: updated!.additionalPercentage,
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
    return /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(time);
  }

  private toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }
}
