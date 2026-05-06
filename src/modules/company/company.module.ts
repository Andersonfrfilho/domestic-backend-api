import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Company } from '@app/modules/shared/providers/database/entities/company.entity';
import { CompanyMember } from '@app/modules/shared/providers/database/entities/company-member.entity';
import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';

import { CompanyController } from './company.controller';
import { CompanyRepository } from './company.repository';
import { CompanyService } from './company.service';
import {
  COMPANY_ADD_MEMBER_USE_CASE_PROVIDE,
  COMPANY_CREATE_USE_CASE_PROVIDE,
  COMPANY_LIST_USER_COMPANIES_USE_CASE_PROVIDE,
  COMPANY_REPOSITORY_PROVIDE,
  COMPANY_SERVICE_PROVIDE,
} from './company.token';
import { AddCompanyMemberUseCase } from './use-cases/add-company-member/add-company-member.use-case';
import { CreateCompanyUseCase } from './use-cases/create-company/create-company.use-case';
import { ListUserCompaniesUseCase } from './use-cases/list-user-companies/list-user-companies.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, CompanyMember], CONNECTIONS_NAMES.POSTGRES),
  ],
  controllers: [CompanyController],
  providers: [
    { provide: COMPANY_REPOSITORY_PROVIDE, useClass: CompanyRepository },
    { provide: COMPANY_SERVICE_PROVIDE, useClass: CompanyService },
    { provide: COMPANY_CREATE_USE_CASE_PROVIDE, useClass: CreateCompanyUseCase },
    { provide: COMPANY_LIST_USER_COMPANIES_USE_CASE_PROVIDE, useClass: ListUserCompaniesUseCase },
    { provide: COMPANY_ADD_MEMBER_USE_CASE_PROVIDE, useClass: AddCompanyMemberUseCase },
  ],
  exports: [COMPANY_REPOSITORY_PROVIDE, COMPANY_SERVICE_PROVIDE],
})
export class CompanyModule {}
