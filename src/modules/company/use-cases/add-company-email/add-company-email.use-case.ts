import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { CompanyEmailType } from '@app/modules/shared/providers/database/entities/company-email.entity';

import { COMPANY_REPOSITORY_PROVIDE } from '../../company.token';
import type { CompanyRepositoryInterface } from '../../company.repository.interface';

import {
  AddCompanyEmailUseCaseInterface,
  AddCompanyEmailUseCaseParams,
  AddCompanyEmailUseCaseResponse,
} from './add-company-email.interface';

export const ADD_COMPANY_EMAIL_LOG_MESSAGES = {
  START_FLOW: 'Starting add company email flow',
  COMPANY_NOT_FOUND: 'Company not found',
  SUCCESS: 'Company email added successfully',
} as const;

@Injectable()
export class AddCompanyEmailUseCase implements AddCompanyEmailUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(COMPANY_REPOSITORY_PROVIDE)
    private readonly companyRepository: CompanyRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: AddCompanyEmailUseCaseParams): Promise<AddCompanyEmailUseCaseResponse> {
    this.logProvider.info({
      message: ADD_COMPANY_EMAIL_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { companyId: params.companyId, email: params.email },
    });

    const company = await this.companyRepository.findById(params.companyId);
    if (!company) {
      this.logProvider.warn({
        message: ADD_COMPANY_EMAIL_LOG_MESSAGES.COMPANY_NOT_FOUND,
        context: this.logContext,
        meta: { companyId: params.companyId },
      });
      throw new Error(`Company with id ${params.companyId} not found`);
    }

    const type = Object.values(CompanyEmailType).includes(params.type as CompanyEmailType)
      ? (params.type as CompanyEmailType)
      : CompanyEmailType.GENERAL;

    const email = await this.companyRepository.createEmail({
      companyId: params.companyId,
      email: params.email,
      type,
      isDefault: params.isDefault ?? false,
    });

    this.logProvider.info({
      message: ADD_COMPANY_EMAIL_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { emailId: email.id, companyId: params.companyId },
    });

    return {
      id: email.id,
      companyId: email.companyId,
      email: email.email,
      type: email.type,
      isDefault: email.isDefault,
    };
  }
}
