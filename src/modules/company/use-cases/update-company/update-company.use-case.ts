import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { CompanyMemberRole } from '@app/modules/shared/providers/database/entities/company-member.entity';

import { COMPANY_REPOSITORY_PROVIDE } from '../../company.token';
import type { CompanyRepositoryInterface } from '../../company.repository.interface';

import {
  UpdateCompanyUseCaseInterface,
  UpdateCompanyUseCaseParams,
  UpdateCompanyUseCaseResponse,
} from './update-company.interface';

export const UPDATE_COMPANY_LOG_MESSAGES = {
  START_FLOW: 'Starting update company flow',
  COMPANY_NOT_FOUND: 'Company not found',
  FORBIDDEN: 'User is not an admin of this company',
  SUCCESS: 'Company updated successfully',
} as const;

@Injectable()
export class UpdateCompanyUseCase implements UpdateCompanyUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(COMPANY_REPOSITORY_PROVIDE)
    private readonly companyRepository: CompanyRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: UpdateCompanyUseCaseParams): Promise<UpdateCompanyUseCaseResponse> {
    this.logProvider.info({
      message: UPDATE_COMPANY_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { companyId: params.companyId, requestingUserId: params.requestingUserId },
    });

    const company = await this.companyRepository.findById(params.companyId);
    if (!company) {
      this.logProvider.warn({
        message: UPDATE_COMPANY_LOG_MESSAGES.COMPANY_NOT_FOUND,
        context: this.logContext,
        meta: { companyId: params.companyId },
      });
      throw new NotFoundException(`Company with id ${params.companyId} not found`);
    }

    const members = await this.companyRepository.findMembersByCompanyId(params.companyId);
    const requestingMember = members.find((m) => m.userId === params.requestingUserId);
    if (!requestingMember || requestingMember.role !== CompanyMemberRole.ADMIN) {
      this.logProvider.warn({
        message: UPDATE_COMPANY_LOG_MESSAGES.FORBIDDEN,
        context: this.logContext,
        meta: { companyId: params.companyId, requestingUserId: params.requestingUserId },
      });
      throw new ForbiddenException('Only company admins can update company data');
    }

    const updated = await this.companyRepository.update(params.companyId, {
      companyName: params.companyName,
      tradeName: params.tradeName,
      email: params.email,
      phone: params.phone,
      stateRegistration: params.stateRegistration,
      municipalRegistration: params.municipalRegistration,
    });

    this.logProvider.info({
      message: UPDATE_COMPANY_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { companyId: params.companyId },
    });

    return {
      id: updated.id,
      companyName: updated.companyName,
      tradeName: updated.tradeName,
      email: updated.email,
      phone: updated.phone,
      stateRegistration: updated.stateRegistration,
      municipalRegistration: updated.municipalRegistration,
      status: updated.status,
    };
  }
}
