import { Injectable, NotFoundException } from '@nestjs/common';

import { ProviderWorkLocationRepository } from '../../repositories/provider-work-location.repository';

@Injectable()
export class RemoveWorkLocationUseCase {
  constructor(private readonly workLocationRepository: ProviderWorkLocationRepository) {}

  async execute(providerId: string, locationId: string): Promise<void> {
    const location = await this.workLocationRepository.findOne(providerId, locationId);
    if (!location) throw new NotFoundException('Localização não encontrada');
    await this.workLocationRepository.softDelete(locationId, providerId);
  }
}
