import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { LOGGER_PROVIDER } from '@adatechnology/logger';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { TermsAcceptanceRepository } from '@modules/shared/providers/database/repositories/terms-acceptance.repository';
import { TermsVersionRepository } from '@modules/shared/providers/database/repositories/terms-version.repository';

import {
  AcceptTermsParams,
  AcceptTermsResponse,
  AcceptTermsUseCaseInterface,
} from './accept-terms.interface';

@Injectable()
export class AcceptTermsUseCase implements AcceptTermsUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
    private readonly termsVersionRepo: TermsVersionRepository,
    private readonly termsAcceptanceRepo: TermsAcceptanceRepository,
  ) {}

  async execute(params: AcceptTermsParams): Promise<AcceptTermsResponse> {
    const targetVersion = params.termsVersionId
      ? await this.termsVersionRepo.findById(params.termsVersionId)
      : await this.termsVersionRepo.findActiveVersion();

    if (!targetVersion) {
      throw new BadRequestException('Nenhuma versão de termos disponível');
    }

    const alreadyAccepted = await this.termsAcceptanceRepo.hasAcceptedVersion(
      params.userId,
      targetVersion.id,
    );

    if (alreadyAccepted) {
      return {
        success: true,
        message: 'Termos já aceitos para esta versão',
        termsVersion: targetVersion.version,
        acceptedAt: new Date(),
      };
    }

    const acceptedAt = new Date();

    await this.termsAcceptanceRepo.create({
      userId: params.userId,
      termsVersionId: targetVersion.id,
      acceptedAt,
      ipAddress: params.ipAddress ?? null,
    });

    this.logProvider.info({
      message: 'Terms accepted successfully',
      context: this.logContext,
      meta: { userId: params.userId, termsVersion: targetVersion.version },
    });

    return {
      success: true,
      message: 'Termos de uso aceitos',
      termsVersion: targetVersion.version,
      acceptedAt,
    };
  }
}
