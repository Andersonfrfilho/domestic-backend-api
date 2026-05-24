import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { CompanyPhoneType } from '@app/modules/shared/providers/database/entities/company-phone.entity';

import { COMPANY_REPOSITORY_PROVIDE } from '../../company.token';
import type { CompanyRepositoryInterface } from '../../company.repository.interface';

import {
  AddCompanyPhoneUseCaseInterface,
  AddCompanyPhoneUseCaseParams,
  AddCompanyPhoneUseCaseResponse,
} from './add-company-phone.interface';

export const ADD_COMPANY_PHONE_LOG_MESSAGES = {
  START_FLOW: 'Starting add company phone flow',
  COMPANY_NOT_FOUND: 'Company not found',
  SUCCESS: 'Company phone added successfully',
} as const;

@Injectable()
export class AddCompanyPhoneUseCase implements AddCompanyPhoneUseCaseInterface {
  @TraceMethod()
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(COMPANY_REPOSITORY_PROVIDE)
    private readonly companyRepository: CompanyRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: AddCompanyPhoneUseCaseParams): Promise<AddCompanyPhoneUseCaseResponse> {
    this.logProvider.info({
      message: ADD_COMPANY_PHONE_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { companyId: params.companyId, phone: params.phone },
    });

    const company = await this.companyRepository.findById(params.companyId);
    if (!company) {
      this.logProvider.warn({
        message: ADD_COMPANY_PHONE_LOG_MESSAGES.COMPANY_NOT_FOUND,
        context: this.logContext,
        meta: { companyId: params.companyId },
      });
      throw new Error(`Company with id ${params.companyId} not found`);
    }

    const type = Object.values(CompanyPhoneType).includes(params.type as CompanyPhoneType)
      ? (params.type as CompanyPhoneType)
      : CompanyPhoneType.LANDLINE;

    const phone = await this.companyRepository.createPhone({
      companyId: params.companyId,
      phone: params.phone,
      type,
      isDefault: params.isDefault ?? false,
    });

    this.logProvider.info({
      message: ADD_COMPANY_PHONE_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { phoneId: phone.id, companyId: params.companyId },
    });

    return {
      id: phone.id,
      companyId: phone.companyId,
      phone: phone.phone,
      type: phone.type,
      isDefault: phone.isDefault,
    };
  }
}
