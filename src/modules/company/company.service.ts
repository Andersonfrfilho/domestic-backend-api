import { Inject, Injectable } from '@nestjs/common';

import {
  COMPANY_ADD_MEMBER_USE_CASE_PROVIDE,
  COMPANY_CREATE_USE_CASE_PROVIDE,
  COMPANY_LIST_USER_COMPANIES_USE_CASE_PROVIDE,
  COMPANY_REPOSITORY_PROVIDE,
} from './company.token';
import type { CompanyRepositoryInterface } from './company.repository.interface';
import type { AddCompanyMemberUseCaseInterface } from './use-cases/add-company-member/add-company-member.interface';
import type { CreateCompanyUseCaseInterface } from './use-cases/create-company/create-company.interface';
import type { ListUserCompaniesUseCaseInterface } from './use-cases/list-user-companies/list-user-companies.interface';

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
}
