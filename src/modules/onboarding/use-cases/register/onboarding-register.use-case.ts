import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { CompanyStatus } from '@app/modules/shared/providers/database/entities/company.entity';
import { CompanyMemberRole } from '@app/modules/shared/providers/database/entities/company-member.entity';

import { COMPANY_REPOSITORY_PROVIDE } from '@modules/company/company.token';
import type { CompanyRepositoryInterface } from '@modules/company/company.repository.interface';
import { USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';
import type { UserRepositoryInterface } from '@modules/user/user.repository.interface';

export const ONBOARDING_REGISTER_LOG_MESSAGES = {
  START_FLOW: 'Starting onboarding register flow',
  USER_CREATED: 'User created successfully',
  COMPANY_CREATED: 'Company created for CNPJ user',
  CNPJ_EXISTS: 'CNPJ already registered',
} as const;

export interface OnboardingRegisterParams {
  keycloakId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  cpf?: string;
  cnpj?: string;
  companyName?: string;
  tradeName?: string;
}

export interface OnboardingRegisterResult {
  userId: string;
  keycloakId: string;
  companyId?: string;
}

@Injectable()
export class OnboardingRegisterUseCase {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(COMPANY_REPOSITORY_PROVIDE)
    private readonly companyRepository: CompanyRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: OnboardingRegisterParams): Promise<OnboardingRegisterResult> {
    this.logProvider.info({
      message: ONBOARDING_REGISTER_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { email: params.email, hasCnpj: Boolean(params.cnpj) },
    });

    const user = await this.userRepository.create({
      fullName: `${params.firstName} ${params.lastName}`,
      keycloakId: params.keycloakId,
      status: 'PENDING',
    });

    this.logProvider.info({
      message: ONBOARDING_REGISTER_LOG_MESSAGES.USER_CREATED,
      context: this.logContext,
      meta: { userId: user.id, keycloakId: user.keycloakId },
    });

    if (params.cnpj) {
      const existingCompany = await this.companyRepository.findByDocument(params.cnpj);
      if (existingCompany) {
        this.logProvider.warn({
          message: ONBOARDING_REGISTER_LOG_MESSAGES.CNPJ_EXISTS,
          context: this.logContext,
          meta: { cnpj: params.cnpj, existingCompanyId: existingCompany.id },
        });
        throw new Error(`CNPJ ${params.cnpj} already registered`);
      }

      const company = await this.companyRepository.create({
        document: params.cnpj,
        companyName: params.companyName || `${params.firstName} ${params.lastName}`,
        tradeName: params.tradeName || null,
        email: params.email,
        phone: params.phone,
        status: CompanyStatus.PENDING,
      });

      await this.companyRepository.createMember({
        companyId: company.id,
        userId: user.id,
        role: CompanyMemberRole.ADMIN,
      });

      this.logProvider.info({
        message: ONBOARDING_REGISTER_LOG_MESSAGES.COMPANY_CREATED,
        context: this.logContext,
        meta: { companyId: company.id, userId: user.id, cnpj: params.cnpj },
      });

      return { userId: user.id, keycloakId: user.keycloakId || '', companyId: company.id };
    }

    return { userId: user.id, keycloakId: user.keycloakId || '' };
  }
}
