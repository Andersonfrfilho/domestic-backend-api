import { Injectable } from '@nestjs/common';

import { ProviderVerificationRepository } from '../../repositories/provider-verification.repository';
import type { VerificationStatusDto } from './get-my-verification.use-case';

@Injectable()
export class SubmitMyVerificationUseCase {
  constructor(private readonly verificationRepository: ProviderVerificationRepository) {}

  async execute(providerId: string): Promise<VerificationStatusDto> {
    const existing = await this.verificationRepository.findLatest(providerId);

    if (!existing || existing.status === 'REJECTED') {
      const created = await this.verificationRepository.create({
        providerId,
        status: 'UNDER_REVIEW',
      });
      return {
        status: created.status,
        submittedAt: created.submittedAt,
        reviewedAt: null,
        notes: null,
      };
    }

    if (existing.status === 'PENDING') {
      const updated = await this.verificationRepository.update(existing.id, {
        status: 'UNDER_REVIEW',
      });
      return {
        status: updated.status,
        submittedAt: updated.submittedAt,
        reviewedAt: updated.reviewedAt ?? null,
        notes: updated.notes ?? null,
      };
    }

    return {
      status: existing.status,
      submittedAt: existing.submittedAt,
      reviewedAt: existing.reviewedAt ?? null,
      notes: existing.notes ?? null,
    };
  }
}
