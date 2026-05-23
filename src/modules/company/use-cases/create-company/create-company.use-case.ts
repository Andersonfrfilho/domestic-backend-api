import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';
import { TraceMethod } from '@adatechnology/logger';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { CompanyStatus } from '@app/modules/shared/providers/database/entities/company.entity';
import { CompanyMemberRole } from '@app/modules/shared/providers/database/entities/company-member.entity';

import { COMPANY_REPOSITORY_PROVIDE } from '../../company.token';
import type { CompanyRepositoryInterface } from '../../company.repository.interface';

import {
  CreateCompanyUseCaseInterface,
  CreateCompanyUseCaseParams,
  CreateCompanyUseCaseResponse,
} from './create-company.interface';

export const CREATE_COMPANY_LOG_MESSAGES = {
  START_FLOW: 'Starting create company flow',
  DOCUMENT_EXISTS: 'Company with this document already exists',
  CREATED_SUCCESS: 'Company created successfully',
} as const;

@Injectable()
export class CreateCompanyUseCase implements CreateCompanyUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(COMPANY_REPOSITORY_PROVIDE)
    private readonly companyRepository: CompanyRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute(params: CreateCompanyUseCaseParams): Promise<CreateCompanyUseCaseResponse> {
    this.logProvider.info({
      message: CREATE_COMPANY_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: {
        document: params.document,
        companyName: params.companyName,
        adminUserId: params.adminUserId,
      },
    });

    const existing = await this.companyRepository.findByDocument(params.document);
    if (existing) {
      this.logProvider.warn({
        message: CREATE_COMPANY_LOG_MESSAGES.DOCUMENT_EXISTS,
        context: this.logContext,
        meta: { document: params.document, existingCompanyId: existing.id },
      });
      throw new Error(`Company with document ${params.document} already exists`);
    }

    const company = await this.companyRepository.create({
      document: params.document,
      companyName: params.companyName,
      tradeName: params.tradeName ?? null,
      email: params.email,
      phone: params.phone,
      stateRegistration: params.stateRegistration ?? null,
      municipalRegistration: params.municipalRegistration ?? null,
      status: CompanyStatus.PENDING,
    });

    await this.companyRepository.createMember({
      companyId: company.id,
      userId: params.adminUserId,
      role: CompanyMemberRole.ADMIN,
      status: 'active' as any,
    });

    this.logProvider.info({
      message: CREATE_COMPANY_LOG_MESSAGES.CREATED_SUCCESS,
      context: this.logContext,
      meta: {
        companyId: company.id,
        document: company.document,
        adminUserId: params.adminUserId,
      },
    });

    return {
      id: company.id,
      document: company.document,
      companyName: company.companyName,
      tradeName: company.tradeName,
      email: company.email,
      phone: company.phone,
      status: company.status,
    };
  }
}
