import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProviderVerification } from '@modules/shared/providers/database/entities/provider-verification.entity';

@Injectable()
export class ProviderVerificationRepository {
  constructor(
    @InjectRepository(ProviderVerification, 'postgres')
    private readonly repository: Repository<ProviderVerification>,
  ) {}

  async findLatest(providerId: string): Promise<ProviderVerification | null> {
    return this.repository.findOne({
      where: { providerId },
      order: { submittedAt: 'DESC' },
    });
  }

  async create(data: { providerId: string; status: string }): Promise<ProviderVerification> {
    const verification = this.repository.create(data);
    return this.repository.save(verification);
  }

  async update(id: string, data: Partial<{ status: string }>): Promise<ProviderVerification> {
    await this.repository.update(id, data);
    return this.repository.findOne({ where: { id } }) as Promise<ProviderVerification>;
  }
}
