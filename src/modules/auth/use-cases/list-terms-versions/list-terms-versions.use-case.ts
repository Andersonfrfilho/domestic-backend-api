import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';
import { TraceMethod } from '@adatechnology/logger';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { TermsVersionRepository } from '@modules/shared/providers/database/repositories/terms-version.repository';

import {
  ListTermsVersionsResponse,
  ListTermsVersionsUseCaseInterface,
} from './list-terms-versions.interface';

@Injectable()
export class ListTermsVersionsUseCase implements ListTermsVersionsUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
    private readonly termsVersionRepo: TermsVersionRepository,
  ) {}

  @TraceMethod()
  async execute(): Promise<ListTermsVersionsResponse[]> {
    const versions = await this.termsVersionRepo.findAll();

    this.logProvider.info({
      message: 'Listed all terms versions',
      context: this.logContext,
      meta: { count: versions.length },
    });

    return versions.map((v) => ({
      id: v.id,
      version: v.version,
      title: v.title,
      contentUrl: v.contentUrl,
      isActive: v.isActive,
      effectiveDate: v.effectiveDate,
    }));
  }
}
