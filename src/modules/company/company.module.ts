import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyAddress } from '@app/modules/shared/providers/database/entities/company-address.entity';
import { CompanyBusinessHours } from '@app/modules/shared/providers/database/entities/company-business-hours.entity';
import { CompanyEmail } from '@app/modules/shared/providers/database/entities/company-email.entity';
import { CompanyMember } from '@app/modules/shared/providers/database/entities/company-member.entity';
import { CompanyPhone } from '@app/modules/shared/providers/database/entities/company-phone.entity';
import { CompanyProvider } from '@app/modules/shared/providers/database/entities/company-provider.entity';
import { Company } from '@app/modules/shared/providers/database/entities/company.entity';
import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';

import { CompanyController } from './company.controller';
import { CompanyRepository } from './company.repository';
import { CompanyService } from './company.service';
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
  COMPANY_SERVICE_PROVIDE,
  COMPANY_SET_BUSINESS_HOURS_USE_CASE_PROVIDE,
} from './company.token';
import { AddCompanyAddressUseCase } from './use-cases/add-company-address/add-company-address.use-case';
import { AddCompanyEmailUseCase } from './use-cases/add-company-email/add-company-email.use-case';
import { AddCompanyMemberUseCase } from './use-cases/add-company-member/add-company-member.use-case';
import { AddCompanyPhoneUseCase } from './use-cases/add-company-phone/add-company-phone.use-case';
import { AddCompanyProviderUseCase } from './use-cases/add-company-provider/add-company-provider.use-case';
import { CreateCompanyUseCase } from './use-cases/create-company/create-company.use-case';
import { GetCompanyDetailsUseCase } from './use-cases/get-company-details/get-company-details.use-case';
import { ListUserCompaniesUseCase } from './use-cases/list-user-companies/list-user-companies.use-case';
import { SetCompanyBusinessHoursUseCase } from './use-cases/set-company-business-hours/set-company-business-hours.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Company, CompanyMember, CompanyAddress, CompanyEmail, CompanyPhone, CompanyBusinessHours, CompanyProvider],
      CONNECTIONS_NAMES.POSTGRES,
    ),
  ],
  controllers: [CompanyController],
  providers: [
    { provide: COMPANY_REPOSITORY_PROVIDE, useClass: CompanyRepository },
    { provide: COMPANY_SERVICE_PROVIDE, useClass: CompanyService },
    { provide: COMPANY_CREATE_USE_CASE_PROVIDE, useClass: CreateCompanyUseCase },
    { provide: COMPANY_LIST_USER_COMPANIES_USE_CASE_PROVIDE, useClass: ListUserCompaniesUseCase },
    { provide: COMPANY_ADD_MEMBER_USE_CASE_PROVIDE, useClass: AddCompanyMemberUseCase },
    { provide: COMPANY_ADD_ADDRESS_USE_CASE_PROVIDE, useClass: AddCompanyAddressUseCase },
    { provide: COMPANY_ADD_EMAIL_USE_CASE_PROVIDE, useClass: AddCompanyEmailUseCase },
    { provide: COMPANY_ADD_PHONE_USE_CASE_PROVIDE, useClass: AddCompanyPhoneUseCase },
    { provide: COMPANY_SET_BUSINESS_HOURS_USE_CASE_PROVIDE, useClass: SetCompanyBusinessHoursUseCase },
    { provide: COMPANY_ADD_PROVIDER_USE_CASE_PROVIDE, useClass: AddCompanyProviderUseCase },
    { provide: COMPANY_GET_DETAILS_USE_CASE_PROVIDE, useClass: GetCompanyDetailsUseCase },
  ],
  exports: [COMPANY_REPOSITORY_PROVIDE, COMPANY_SERVICE_PROVIDE],
})
export class CompanyModule {}
