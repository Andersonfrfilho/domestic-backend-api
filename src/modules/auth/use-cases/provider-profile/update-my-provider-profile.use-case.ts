import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';
import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';

export interface UpdateMyProviderProfileParams {
  providerId: string;
  businessName?: string;
  description?: string;
  isAvailable?: boolean;
}

export interface UpdateMyProviderProfileResult {
  id: string;
  businessName: string | null;
  description: string | null;
  isAvailable: boolean;
  avatarUrl: string | null;
}

@Injectable()
export class UpdateMyProviderProfileUseCase {
  constructor(
    @InjectRepository(ProviderProfile, CONNECTIONS_NAMES.POSTGRES)
    private readonly profileRepository: Repository<ProviderProfile>,
  ) {}

  async execute(params: UpdateMyProviderProfileParams): Promise<UpdateMyProviderProfileResult> {
    const { providerId, ...updates } = params;

    const profile = await this.profileRepository.findOne({ where: { id: providerId } });
    if (!profile) throw new NotFoundException('Perfil de prestador não encontrado');

    await this.profileRepository.update(providerId, updates);
    const updated = await this.profileRepository.findOne({ where: { id: providerId } });

    return {
      id: updated!.id,
      businessName: updated!.businessName ?? null,
      description: updated!.description ?? null,
      isAvailable: updated!.isAvailable,
      avatarUrl: updated!.avatarUrl ?? null,
    };
  }
}
