import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProviderAvailability } from '@modules/shared/providers/database/entities/provider-availability.entity';

@Injectable()
export class ProviderAvailabilityRepository {
  constructor(
    @InjectRepository(ProviderAvailability, 'postgres')
    private readonly repository: Repository<ProviderAvailability>,
  ) {}

  async create(data: {
    providerId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    additionalPercentage?: number;
  }): Promise<ProviderAvailability> {
    const availability = this.repository.create(data);
    return this.repository.save(availability);
  }

  async findById(id: string): Promise<ProviderAvailability | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByProviderIdAndDay(
    providerId: string,
    dayOfWeek: number,
  ): Promise<ProviderAvailability[]> {
    return this.repository.find({
      where: { providerId, dayOfWeek, isActive: true },
      order: { startTime: 'ASC' },
    });
  }

  async findByProviderId(providerId: string): Promise<ProviderAvailability[]> {
    return this.repository.find({
      where: { providerId, isActive: true },
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  async update(
    id: string,
    data: Partial<{
      startTime: string;
      endTime: string;
      isActive: boolean;
      additionalPercentage: number;
    }>,
  ): Promise<ProviderAvailability | null> {
    await this.repository.update(id, data);
    return this.repository.findOne({ where: { id } });
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
