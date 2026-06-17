import { Inject, Injectable } from '@nestjs/common';

import {
  COMPANY_ADD_ADDRESS_USE_CASE_PROVIDE,
  COMPANY_ADD_EMAIL_USE_CASE_PROVIDE,
  COMPANY_ADD_MEMBER_USE_CASE_PROVIDE,
  COMPANY_ADD_PHONE_USE_CASE_PROVIDE,
  COMPANY_ADD_PROVIDER_USE_CASE_PROVIDE,
  COMPANY_CREATE_USE_CASE_PROVIDE,
  COMPANY_GET_DETAILS_USE_CASE_PROVIDE,
  COMPANY_LIST_USER_COMPANIES_USE_CASE_PROVIDE,
  COMPANY_REPOSITORY_PROVIDE,
  COMPANY_SET_BUSINESS_HOURS_USE_CASE_PROVIDE,
  COMPANY_UPDATE_USE_CASE_PROVIDE,
} from './company.token';
import type { CompanyRepositoryInterface } from './company.repository.interface';
import type { AddCompanyAddressUseCaseInterface } from './use-cases/add-company-address/add-company-address.interface';
import type { AddCompanyEmailUseCaseInterface } from './use-cases/add-company-email/add-company-email.interface';
import type { AddCompanyMemberUseCaseInterface } from './use-cases/add-company-member/add-company-member.interface';
import type { AddCompanyPhoneUseCaseInterface } from './use-cases/add-company-phone/add-company-phone.interface';
import type { AddCompanyProviderUseCaseInterface } from './use-cases/add-company-provider/add-company-provider.interface';
import type { CreateCompanyUseCaseInterface } from './use-cases/create-company/create-company.interface';
import type { GetCompanyDetailsUseCaseInterface } from './use-cases/get-company-details/get-company-details.interface';
import type { ListUserCompaniesUseCaseInterface } from './use-cases/list-user-companies/list-user-companies.interface';
import type { SetCompanyBusinessHoursUseCaseInterface } from './use-cases/set-company-business-hours/set-company-business-hours.interface';
import type { UpdateCompanyUseCaseInterface } from './use-cases/update-company/update-company.interface';

@Injectable()
export class CompanyService {
  constructor(
    @Inject(COMPANY_REPOSITORY_PROVIDE)
    private readonly companyRepository: CompanyRepositoryInterface,
    @Inject(COMPANY_CREATE_USE_CASE_PROVIDE)
    private readonly createCompanyUseCase: CreateCompanyUseCaseInterface,
    @Inject(COMPANY_LIST_USER_COMPANIES_USE_CASE_PROVIDE)
    private readonly listUserCompaniesUseCase: ListUserCompaniesUseCaseInterface,
    @Inject(COMPANY_ADD_MEMBER_USE_CASE_PROVIDE)
    private readonly addMemberUseCase: AddCompanyMemberUseCaseInterface,
    @Inject(COMPANY_ADD_ADDRESS_USE_CASE_PROVIDE)
    private readonly addAddressUseCase: AddCompanyAddressUseCaseInterface,
    @Inject(COMPANY_ADD_EMAIL_USE_CASE_PROVIDE)
    private readonly addEmailUseCase: AddCompanyEmailUseCaseInterface,
    @Inject(COMPANY_ADD_PHONE_USE_CASE_PROVIDE)
    private readonly addPhoneUseCase: AddCompanyPhoneUseCaseInterface,
    @Inject(COMPANY_SET_BUSINESS_HOURS_USE_CASE_PROVIDE)
    private readonly setBusinessHoursUseCase: SetCompanyBusinessHoursUseCaseInterface,
    @Inject(COMPANY_ADD_PROVIDER_USE_CASE_PROVIDE)
    private readonly addProviderUseCase: AddCompanyProviderUseCaseInterface,
    @Inject(COMPANY_GET_DETAILS_USE_CASE_PROVIDE)
    private readonly getDetailsUseCase: GetCompanyDetailsUseCaseInterface,
    @Inject(COMPANY_UPDATE_USE_CASE_PROVIDE)
    private readonly updateCompanyUseCase: UpdateCompanyUseCaseInterface,
  ) {}

  async createCompany(params: Parameters<CreateCompanyUseCaseInterface['execute']>[0]) {
    return this.createCompanyUseCase.execute(params);
  }

  async listUserCompanies(userId: string) {
    return this.listUserCompaniesUseCase.execute({ userId });
  }

  async addMember(params: Parameters<AddCompanyMemberUseCaseInterface['execute']>[0]) {
    return this.addMemberUseCase.execute(params);
  }

  async addAddress(params: Parameters<AddCompanyAddressUseCaseInterface['execute']>[0]) {
    return this.addAddressUseCase.execute(params);
  }

  async addEmail(params: Parameters<AddCompanyEmailUseCaseInterface['execute']>[0]) {
    return this.addEmailUseCase.execute(params);
  }

  async addPhone(params: Parameters<AddCompanyPhoneUseCaseInterface['execute']>[0]) {
    return this.addPhoneUseCase.execute(params);
  }

  async setBusinessHours(params: Parameters<SetCompanyBusinessHoursUseCaseInterface['execute']>[0]) {
    return this.setBusinessHoursUseCase.execute(params);
  }

  async addProvider(params: Parameters<AddCompanyProviderUseCaseInterface['execute']>[0]) {
    return this.addProviderUseCase.execute(params);
  }

  async getDetails(companyId: string) {
    return this.getDetailsUseCase.execute({ companyId });
  }

  async updateCompany(params: Parameters<UpdateCompanyUseCaseInterface['execute']>[0]) {
    return this.updateCompanyUseCase.execute(params);
  }
}
