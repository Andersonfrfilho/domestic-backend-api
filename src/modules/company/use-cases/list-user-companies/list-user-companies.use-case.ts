import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { COMPANY_REPOSITORY_PROVIDE } from '../../company.token';
import type { CompanyRepositoryInterface } from '../../company.repository.interface';

import {
  ListUserCompaniesUseCaseInterface,
  ListUserCompaniesUseCaseParams,
  ListUserCompaniesUseCaseResponse,
} from './list-user-companies.interface';

export const LIST_USER_COMPANIES_LOG_MESSAGES = {
  START_FLOW: 'Starting list user companies flow',
  SUCCESS: 'User companies listed successfully',
} as const;

@Injectable()
export class ListUserCompaniesUseCase implements ListUserCompaniesUseCaseInterface {
  @TraceMethod()
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(COMPANY_REPOSITORY_PROVIDE)
    private readonly companyRepository: CompanyRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: ListUserCompaniesUseCaseParams): Promise<ListUserCompaniesUseCaseResponse> {
    this.logProvider.info({
      message: LIST_USER_COMPANIES_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { userId: params.userId },
    });

    const companies = await this.companyRepository.findUserCompanies(params.userId);

    this.logProvider.info({
      message: LIST_USER_COMPANIES_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { userId: params.userId, count: companies.length },
    });

    return {
      companies: companies.map((c) => ({
        id: c.id,
        document: c.document,
        companyName: c.companyName,
        tradeName: c.tradeName,
        email: c.email,
        phone: c.phone,
        status: c.status,
        role: (c as any).members?.find((m: any) => m.userId === params.userId)?.role ?? 'member',
      })),
    };
  }
}
