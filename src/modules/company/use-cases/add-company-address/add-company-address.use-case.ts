import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';
import { TraceMethod } from '@adatechnology/shared';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { CompanyAddressType } from '@app/modules/shared/providers/database/entities/company-address.entity';

import { COMPANY_REPOSITORY_PROVIDE } from '../../company.token';
import type { CompanyRepositoryInterface } from '../../company.repository.interface';

import {
  AddCompanyAddressUseCaseInterface,
  AddCompanyAddressUseCaseParams,
  AddCompanyAddressUseCaseResponse,
} from './add-company-address.interface';

export const ADD_COMPANY_ADDRESS_LOG_MESSAGES = {
  START_FLOW: 'Starting add company address flow',
  COMPANY_NOT_FOUND: 'Company not found',
  SUCCESS: 'Company address added successfully',
} as const;

@Injectable()
export class AddCompanyAddressUseCase implements AddCompanyAddressUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(COMPANY_REPOSITORY_PROVIDE)
    private readonly companyRepository: CompanyRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute(params: AddCompanyAddressUseCaseParams): Promise<AddCompanyAddressUseCaseResponse> {
    this.logProvider.info({
      message: ADD_COMPANY_ADDRESS_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { companyId: params.companyId, type: params.type },
    });

    const company = await this.companyRepository.findById(params.companyId);
    if (!company) {
      this.logProvider.warn({
        message: ADD_COMPANY_ADDRESS_LOG_MESSAGES.COMPANY_NOT_FOUND,
        context: this.logContext,
        meta: { companyId: params.companyId },
      });
      throw new Error(`Company with id ${params.companyId} not found`);
    }

    const type = Object.values(CompanyAddressType).includes(params.type as CompanyAddressType)
      ? (params.type as CompanyAddressType)
      : CompanyAddressType.HEADQUARTERS;

    const address = await this.companyRepository.createAddress({
      companyId: params.companyId,
      type,
      zipCode: params.zipCode,
      street: params.street,
      number: params.number,
      complement: params.complement ?? null,
      neighborhood: params.neighborhood,
      city: params.city,
      state: params.state,
      country: params.country ?? 'BR',
      latitude: params.latitude ?? null,
      longitude: params.longitude ?? null,
      isDefault: params.isDefault ?? true,
    });

    this.logProvider.info({
      message: ADD_COMPANY_ADDRESS_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { addressId: address.id, companyId: params.companyId },
    });

    return {
      id: address.id,
      companyId: address.companyId,
      type: address.type,
      zipCode: address.zipCode,
      street: address.street,
      number: address.number,
      complement: address.complement,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      country: address.country,
      latitude: address.latitude,
      longitude: address.longitude,
      isDefault: address.isDefault,
    };
  }
}
