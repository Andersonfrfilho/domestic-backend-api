import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { COMPANY_REPOSITORY_PROVIDE } from '../../company.token';
import type { CompanyRepositoryInterface } from '../../company.repository.interface';

import {
  GetCompanyDetailsUseCaseInterface,
  GetCompanyDetailsUseCaseParams,
  GetCompanyDetailsUseCaseResponse,
} from './get-company-details.interface';

export const GET_COMPANY_DETAILS_LOG_MESSAGES = {
  START_FLOW: 'Starting get company details flow',
  COMPANY_NOT_FOUND: 'Company not found',
  SUCCESS: 'Company details retrieved successfully',
} as const;

@Injectable()
export class GetCompanyDetailsUseCase implements GetCompanyDetailsUseCaseInterface {
  @TraceMethod()
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(COMPANY_REPOSITORY_PROVIDE)
    private readonly companyRepository: CompanyRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: GetCompanyDetailsUseCaseParams): Promise<GetCompanyDetailsUseCaseResponse> {
    this.logProvider.info({
      message: GET_COMPANY_DETAILS_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { companyId: params.companyId },
    });

    const company = await this.companyRepository.findById(params.companyId);
    if (!company) {
      this.logProvider.warn({
        message: GET_COMPANY_DETAILS_LOG_MESSAGES.COMPANY_NOT_FOUND,
        context: this.logContext,
        meta: { companyId: params.companyId },
      });
      throw new Error(`Company with id ${params.companyId} not found`);
    }

    const [addresses, emails, phones, businessHours, members, providers] = await Promise.all([
      this.companyRepository.findAddressesByCompanyId(params.companyId),
      this.companyRepository.findEmailsByCompanyId(params.companyId),
      this.companyRepository.findPhonesByCompanyId(params.companyId),
      this.companyRepository.findBusinessHoursByCompanyId(params.companyId),
      this.companyRepository.findMembersByCompanyId(params.companyId),
      this.companyRepository.findProvidersByCompanyId(params.companyId),
    ]);

    this.logProvider.info({
      message: GET_COMPANY_DETAILS_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { companyId: params.companyId },
    });

    return {
      id: company.id,
      document: company.document,
      companyName: company.companyName,
      tradeName: company.tradeName,
      email: company.email,
      phone: company.phone,
      status: company.status,
      addresses: addresses.map((a) => ({
        id: a.id,
        type: a.type,
        zipCode: a.zipCode,
        street: a.street,
        number: a.number,
        city: a.city,
        state: a.state,
        isDefault: a.isDefault,
      })),
      emails: emails.map((e) => ({
        id: e.id,
        email: e.email,
        type: e.type,
        isDefault: e.isDefault,
      })),
      phones: phones.map((p) => ({
        id: p.id,
        phone: p.phone,
        type: p.type,
        isDefault: p.isDefault,
      })),
      businessHours: businessHours.map((bh) => ({
        id: bh.id,
        dayOfWeek: bh.dayOfWeek,
        isOpen: bh.isOpen,
        openTime: bh.openTime,
        closeTime: bh.closeTime,
      })),
      members: members.map((m) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        status: m.status,
      })),
      providers: providers.map((p) => ({
        id: p.id,
        providerId: p.providerId,
        role: p.role,
        status: p.status,
      })),
    };
  }
}
