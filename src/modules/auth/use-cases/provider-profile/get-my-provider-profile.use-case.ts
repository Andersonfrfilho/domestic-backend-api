import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';
import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';

export interface GetMyProviderProfileResult {
  id: string;
  businessName: string | null;
  description: string | null;
  isAvailable: boolean;
  avatarUrl: string | null;
  averageRating: number;
}

@Injectable()
export class GetMyProviderProfileUseCase {
  constructor(
    @InjectRepository(ProviderProfile, CONNECTIONS_NAMES.POSTGRES)
    private readonly profileRepository: Repository<ProviderProfile>,
  ) {}

  async execute(providerId: string): Promise<GetMyProviderProfileResult> {
    const profile = await this.profileRepository.findOne({ where: { id: providerId } });
    if (!profile) throw new NotFoundException('Perfil de prestador não encontrado');

    return {
      id: profile.id,
      businessName: profile.businessName ?? null,
      description: profile.description ?? null,
      isAvailable: profile.isAvailable,
      avatarUrl: profile.avatarUrl ?? null,
      averageRating: Number(profile.averageRating),
    };
  }
}
