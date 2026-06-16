import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable, BadRequestException, ConflictException } from '@nestjs/common';

import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { ProviderAvailability } from '@modules/shared/providers/database/entities/provider-availability.entity';

import { ProviderAvailabilityRepository } from '../../repositories/provider-availability.repository';

import type {
  SetProviderAvailabilityParams,
  SetProviderAvailabilityResult,
  SetProviderAvailabilityUseCaseInterface,
} from './types';

@Injectable()
export class SetProviderAvailabilityUseCase implements SetProviderAvailabilityUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
    private readonly availabilityRepository: ProviderAvailabilityRepository,
  ) {}

  @TraceMethod()
  async execute(params: SetProviderAvailabilityParams): Promise<SetProviderAvailabilityResult> {
    this.logProvider.info({
      message: 'Setting provider availability',
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

      const startMin = this.toMinutes(params.startTime);
      const endMin = this.toMinutes(params.endTime);

      if (startMin >= endMin) {
        throw new BadRequestException('Hora de início deve ser menor que hora de término');
      }

      const existing = await this.availabilityRepository.findByProviderIdAndDay(
        params.providerId,
        params.dayOfWeek,
      );

      const newPercentage = params.additionalPercentage ?? 0;

      for (const slot of existing) {
        const slotStart = this.toMinutes(slot.startTime.substring(0, 5));
        const slotEnd = this.toMinutes(slot.endTime.substring(0, 5));
        if (startMin < slotEnd && endMin > slotStart) {
          throw new ConflictException('Horário conflita com uma faixa já cadastrada');
        }
      }

      // Merge with adjacent slots that share the same additionalPercentage
      const adjacentBefore = existing.find(
        (slot) =>
          slot.endTime.substring(0, 5) === params.startTime &&
          slot.additionalPercentage === newPercentage,
      );
      const adjacentAfter = existing.find(
        (slot) =>
          slot.startTime.substring(0, 5) === params.endTime &&
          slot.additionalPercentage === newPercentage,
      );

      let availability: ProviderAvailability;

      if (adjacentBefore && adjacentAfter) {
        // New slot fills the gap between two adjacent same-% slots → merge all three
        const mergedEnd = adjacentAfter.endTime.substring(0, 5);
        await this.availabilityRepository.update(adjacentBefore.id, { endTime: mergedEnd });
        await this.availabilityRepository.deleteById(adjacentAfter.id);
        availability = (await this.availabilityRepository.findById(adjacentBefore.id))!;
      } else if (adjacentBefore) {
        // Extend the before-slot's end time to cover the new slot
        await this.availabilityRepository.update(adjacentBefore.id, { endTime: params.endTime });
        availability = (await this.availabilityRepository.findById(adjacentBefore.id))!;
      } else if (adjacentAfter) {
        // Extend the after-slot's start time to cover the new slot
        await this.availabilityRepository.update(adjacentAfter.id, { startTime: params.startTime });
        availability = (await this.availabilityRepository.findById(adjacentAfter.id))!;
      } else {
        availability = await this.availabilityRepository.create({
          providerId: params.providerId,
          dayOfWeek: params.dayOfWeek,
          startTime: params.startTime,
          endTime: params.endTime,
          additionalPercentage: newPercentage,
        });
      }

      this.logProvider.info({
        message: 'Provider availability set successfully',
        context: this.logContext,
        meta: { availabilityId: availability.id },
      });

      return {
        success: true,
        data: {
          id: availability.id,
          dayOfWeek: availability.dayOfWeek,
          startTime: availability.startTime.substring(0, 5),
          endTime: availability.endTime.substring(0, 5),
          isActive: availability.isActive,
          additionalPercentage: availability.additionalPercentage,
        },
      };
    } catch (error) {
      this.logProvider.error({
        message: 'Failed to set provider availability',
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
