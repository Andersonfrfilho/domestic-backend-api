import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { CompanyMemberRole, CompanyMemberStatus } from '@app/modules/shared/providers/database/entities/company-member.entity';

import { COMPANY_REPOSITORY_PROVIDE } from '../../company.token';
import type { CompanyRepositoryInterface } from '../../company.repository.interface';

import {
  AddCompanyMemberUseCaseInterface,
  AddCompanyMemberUseCaseParams,
  AddCompanyMemberUseCaseResponse,
} from './add-company-member.interface';

export const ADD_COMPANY_MEMBER_LOG_MESSAGES = {
  START_FLOW: 'Starting add company member flow',
  COMPANY_NOT_FOUND: 'Company not found',
  MEMBER_EXISTS: 'User is already a member of this company',
  SUCCESS: 'Company member added successfully',
} as const;

@Injectable()
export class AddCompanyMemberUseCase implements AddCompanyMemberUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(COMPANY_REPOSITORY_PROVIDE)
    private readonly companyRepository: CompanyRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: AddCompanyMemberUseCaseParams): Promise<AddCompanyMemberUseCaseResponse> {
    this.logProvider.info({
      message: ADD_COMPANY_MEMBER_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: {
        companyId: params.companyId,
        userId: params.userId,
        role: params.role,
      },
    });

    const company = await this.companyRepository.findById(params.companyId);
    if (!company) {
      this.logProvider.warn({
        message: ADD_COMPANY_MEMBER_LOG_MESSAGES.COMPANY_NOT_FOUND,
        context: this.logContext,
        meta: { companyId: params.companyId },
      });
      throw new Error(`Company with id ${params.companyId} not found`);
    }

    const members = await this.companyRepository.findMembersByCompanyId(params.companyId);
    const existingMember = members.find((m) => m.userId === params.userId);
    if (existingMember) {
      this.logProvider.warn({
        message: ADD_COMPANY_MEMBER_LOG_MESSAGES.MEMBER_EXISTS,
        context: this.logContext,
        meta: { companyId: params.companyId, userId: params.userId },
      });
      throw new Error(`User is already a member of this company`);
    }

    const role = Object.values(CompanyMemberRole).includes(params.role as CompanyMemberRole)
      ? (params.role as CompanyMemberRole)
      : CompanyMemberRole.PARTNER;

    const member = await this.companyRepository.createMember({
      companyId: params.companyId,
      userId: params.userId,
      role,
      status: CompanyMemberStatus.ACTIVE,
    });

    this.logProvider.info({
      message: ADD_COMPANY_MEMBER_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: {
        memberId: member.id,
        companyId: params.companyId,
        userId: params.userId,
        role: member.role,
      },
    });

    return {
      id: member.id,
      companyId: member.companyId,
      userId: member.userId,
      role: member.role,
      status: member.status,
    };
  }
}
