import { Injectable } from '@nestjs/common';

import { ProviderVerificationRepository } from '../../repositories/provider-verification.repository';

export interface VerificationStatusDto {
  status: string | null;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  notes: string | null;
}

@Injectable()
export class GetMyVerificationUseCase {
  constructor(private readonly verificationRepository: ProviderVerificationRepository) {}

  async execute(providerId: string): Promise<VerificationStatusDto> {
    const verification = await this.verificationRepository.findLatest(providerId);
    return {
      status: verification?.status ?? null,
      submittedAt: verification?.submittedAt ?? null,
      reviewedAt: verification?.reviewedAt ?? null,
      notes: verification?.notes ?? null,
    };
  }
}
