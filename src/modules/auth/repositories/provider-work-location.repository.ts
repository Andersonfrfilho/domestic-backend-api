import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProviderWorkLocation } from '@modules/shared/providers/database/entities/provider-work-location.entity';

@Injectable()
export class ProviderWorkLocationRepository {
  constructor(
    @InjectRepository(ProviderWorkLocation, 'postgres')
    private readonly repository: Repository<ProviderWorkLocation>,
  ) {}

  async findByProviderId(providerId: string): Promise<ProviderWorkLocation[]> {
    return this.repository.find({
      where: { providerId, isActive: true },
      relations: ['address'],
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
  }

  async findOne(providerId: string, locationId: string): Promise<ProviderWorkLocation | null> {
    return this.repository.findOne({
      where: { id: locationId, providerId, isActive: true },
      relations: ['address'],
    });
  }

  async create(data: {
    providerId: string;
    addressId: string;
    name?: string;
    isPrimary?: boolean;
  }): Promise<ProviderWorkLocation> {
    const location = this.repository.create({ ...data, isActive: true });
    return this.repository.save(location);
  }

  async softDelete(locationId: string, providerId: string): Promise<void> {
    await this.repository.update({ id: locationId, providerId }, { isActive: false });
  }
}
