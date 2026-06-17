import { Injectable } from '@nestjs/common';

import { ProviderWorkLocationRepository } from '../../repositories/provider-work-location.repository';
import type { WorkLocationDto } from './get-work-locations.use-case';

export interface AddWorkLocationParams {
  providerId: string;
  addressId: string;
  name?: string;
  isPrimary?: boolean;
}

@Injectable()
export class AddWorkLocationUseCase {
  constructor(private readonly workLocationRepository: ProviderWorkLocationRepository) {}

  async execute(params: AddWorkLocationParams): Promise<WorkLocationDto> {
    const location = await this.workLocationRepository.create(params);
    const withRelation = await this.workLocationRepository.findOne(
      params.providerId,
      location.id,
    );

    return {
      id: withRelation!.id,
      addressId: withRelation!.addressId,
      name: withRelation!.name ?? null,
      isPrimary: withRelation!.isPrimary,
      city: withRelation!.address.city,
      state: withRelation!.address.state,
      street: withRelation!.address.street,
      neighborhood: withRelation!.address.neighborhood,
    };
  }
}
