import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { CompanyProviderRole, CompanyProviderStatus } from '@app/modules/shared/providers/database/entities/company-provider.entity';

import { COMPANY_REPOSITORY_PROVIDE } from '../../company.token';
import type { CompanyRepositoryInterface } from '../../company.repository.interface';

import {
  AddCompanyProviderUseCaseInterface,
  AddCompanyProviderUseCaseParams,
  AddCompanyProviderUseCaseResponse,
} from './add-company-provider.interface';

export const ADD_COMPANY_PROVIDER_LOG_MESSAGES = {
  START_FLOW: 'Starting add company provider flow',
  COMPANY_NOT_FOUND: 'Company not found',
  SUCCESS: 'Company provider added successfully',
} as const;

@Injectable()
export class AddCompanyProviderUseCase implements AddCompanyProviderUseCaseInterface {
  @TraceMethod()
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(COMPANY_REPOSITORY_PROVIDE)
    private readonly companyRepository: CompanyRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: AddCompanyProviderUseCaseParams): Promise<AddCompanyProviderUseCaseResponse> {
    this.logProvider.info({
      message: ADD_COMPANY_PROVIDER_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { companyId: params.companyId, providerId: params.providerId, role: params.role },
    });

    const company = await this.companyRepository.findById(params.companyId);
    if (!company) {
      this.logProvider.warn({
        message: ADD_COMPANY_PROVIDER_LOG_MESSAGES.COMPANY_NOT_FOUND,
        context: this.logContext,
        meta: { companyId: params.companyId },
      });
      throw new Error(`Company with id ${params.companyId} not found`);
    }

    const role = Object.values(CompanyProviderRole).includes(params.role as CompanyProviderRole)
      ? (params.role as CompanyProviderRole)
      : CompanyProviderRole.EMPLOYEE;

    const provider = await this.companyRepository.createProvider({
      companyId: params.companyId,
      providerId: params.providerId,
      role,
      commissionRate: params.commissionRate ?? null,
      fixedSalary: params.fixedSalary ?? null,
      status: CompanyProviderStatus.PENDING,
    });

    this.logProvider.info({
      message: ADD_COMPANY_PROVIDER_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { providerLinkId: provider.id, companyId: params.companyId, providerId: params.providerId },
    });

    return {
      id: provider.id,
      companyId: provider.companyId,
      providerId: provider.providerId,
      role: provider.role,
      commissionRate: provider.commissionRate,
      fixedSalary: provider.fixedSalary,
      status: provider.status,
    };
  }
}
