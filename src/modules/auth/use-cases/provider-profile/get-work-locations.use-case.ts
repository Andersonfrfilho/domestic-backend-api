import { Injectable } from '@nestjs/common';

import { ProviderWorkLocationRepository } from '../../repositories/provider-work-location.repository';

export interface WorkLocationDto {
  id: string;
  addressId: string;
  name: string | null;
  isPrimary: boolean;
  city: string;
  state: string;
  street: string;
  neighborhood: string;
}

@Injectable()
export class GetWorkLocationsUseCase {
  constructor(private readonly workLocationRepository: ProviderWorkLocationRepository) {}

  async execute(providerId: string): Promise<WorkLocationDto[]> {
    const locations = await this.workLocationRepository.findByProviderId(providerId);
    return locations.map((location) => ({
      id: location.id,
      addressId: location.addressId,
      name: location.name ?? null,
      isPrimary: location.isPrimary,
      city: location.address.city,
      state: location.address.state,
      street: location.address.street,
      neighborhood: location.address.neighborhood,
    }));
  }
}
