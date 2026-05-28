import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProviderService } from '@modules/shared/providers/database/entities/provider-service.entity';

@Injectable()
export class ProviderServiceRepository {
  constructor(
    @InjectRepository(ProviderService, 'postgres')
    private readonly repository: Repository<ProviderService>,
  ) {}

  async create(data: {
    providerId: string;
    serviceId: string;
    priceBase?: number;
    priceType?: string;
    estimatedDurationMinutes?: number;
    pricePerHour?: number;
  }): Promise<ProviderService> {
    const providerService = this.repository.create(data);
    return this.repository.save(providerService);
  }

  async findById(id: string): Promise<ProviderService | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['service', 'service.category'],
    });
  }

  async findByProviderId(providerId: string): Promise<ProviderService[]> {
    return this.repository.find({
      where: { providerId },
      relations: ['service', 'service.category'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    data: Partial<{
      priceBase: number;
      priceType: string;
      estimatedDurationMinutes: number;
      pricePerHour: number;
      isActive: boolean;
    }>,
  ): Promise<ProviderService | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
