import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { TermsAcceptanceRepository } from '@modules/shared/providers/database/repositories/terms-acceptance.repository';
import { TermsVersionRepository } from '@modules/shared/providers/database/repositories/terms-version.repository';

import {
  CheckPendingTermsParams,
  CheckPendingTermsResponse,
  CheckPendingTermsUseCaseInterface,
} from './check-pending-terms.interface';

@Injectable()
export class CheckPendingTermsUseCase implements CheckPendingTermsUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
    private readonly termsVersionRepo: TermsVersionRepository,
    private readonly termsAcceptanceRepo: TermsAcceptanceRepository,
  ) {}

  async execute(params: CheckPendingTermsParams): Promise<CheckPendingTermsResponse> {
    const activeVersion = await this.termsVersionRepo.findActiveVersion();
    const lastAcceptance = await this.termsAcceptanceRepo.findLatestByUserId(params.userId);

    if (!activeVersion) {
      return {
        hasPending: false,
        currentVersion: null,
        lastAcceptedVersion: lastAcceptance?.termsVersion?.version ?? null,
      };
    }

    if (!lastAcceptance) {
      this.logProvider.info({
        message: 'User has never accepted terms',
        context: this.logContext,
        meta: { userId: params.userId },
      });
      return {
        hasPending: true,
        currentVersion: activeVersion.version,
        lastAcceptedVersion: null,
      };
    }

    const hasPending = lastAcceptance.termsVersion.id !== activeVersion.id;

    this.logProvider.info({
      message: 'Terms pending check completed',
      context: this.logContext,
      meta: {
        userId: params.userId,
        hasPending,
        currentVersion: activeVersion.version,
        lastAcceptedVersion: lastAcceptance.termsVersion.version,
      },
    });

    return {
      hasPending,
      currentVersion: activeVersion.version,
      lastAcceptedVersion: lastAcceptance.termsVersion.version,
    };
  }
}
