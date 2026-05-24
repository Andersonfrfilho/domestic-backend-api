import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { TermsVersionRepository } from '@modules/shared/providers/database/repositories/terms-version.repository';

import {
  GetCurrentTermsVersionResponse,
  GetCurrentTermsVersionUseCaseInterface,
} from './get-current-terms.interface';

@Injectable()
export class GetCurrentTermsVersionUseCase implements GetCurrentTermsVersionUseCaseInterface {
  @TraceMethod()
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
    private readonly termsVersionRepo: TermsVersionRepository,
  ) {}

  async execute(): Promise<GetCurrentTermsVersionResponse | null> {
    const activeVersion = await this.termsVersionRepo.findActiveVersion();

    if (!activeVersion) {
      this.logProvider.warn({
        message: 'No active terms version found',
        context: this.logContext,
      });
      return null;
    }

    return {
      id: activeVersion.id,
      version: activeVersion.version,
      title: activeVersion.title,
      contentUrl: activeVersion.contentUrl,
      effectiveDate: activeVersion.effectiveDate,
    };
  }
}
