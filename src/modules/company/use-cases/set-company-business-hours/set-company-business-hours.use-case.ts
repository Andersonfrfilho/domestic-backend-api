import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { COMPANY_REPOSITORY_PROVIDE } from '../../company.token';
import type { CompanyRepositoryInterface } from '../../company.repository.interface';

import {
  SetCompanyBusinessHoursUseCaseInterface,
  SetCompanyBusinessHoursUseCaseParams,
  SetCompanyBusinessHoursUseCaseResponse,
} from './set-company-business-hours.interface';

export const SET_BUSINESS_HOURS_LOG_MESSAGES = {
  START_FLOW: 'Starting set company business hours flow',
  COMPANY_NOT_FOUND: 'Company not found',
  SUCCESS: 'Company business hours set successfully',
} as const;

@Injectable()
export class SetCompanyBusinessHoursUseCase implements SetCompanyBusinessHoursUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(COMPANY_REPOSITORY_PROVIDE)
    private readonly companyRepository: CompanyRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: SetCompanyBusinessHoursUseCaseParams): Promise<SetCompanyBusinessHoursUseCaseResponse> {
    this.logProvider.info({
      message: SET_BUSINESS_HOURS_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { companyId: params.companyId, count: params.businessHours.length },
    });

    const company = await this.companyRepository.findById(params.companyId);
    if (!company) {
      this.logProvider.warn({
        message: SET_BUSINESS_HOURS_LOG_MESSAGES.COMPANY_NOT_FOUND,
        context: this.logContext,
        meta: { companyId: params.companyId },
      });
      throw new Error(`Company with id ${params.companyId} not found`);
    }

    const results = await Promise.all(
      params.businessHours.map((bh) =>
        this.companyRepository.createBusinessHours({
          companyId: params.companyId,
          dayOfWeek: bh.dayOfWeek,
          isOpen: bh.isOpen,
          openTime: bh.openTime ?? null,
          closeTime: bh.closeTime ?? null,
        }),
      ),
    );

    this.logProvider.info({
      message: SET_BUSINESS_HOURS_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { companyId: params.companyId, count: results.length },
    });

    return {
      businessHours: results.map((r) => ({
        id: r.id,
        companyId: r.companyId,
        dayOfWeek: r.dayOfWeek,
        isOpen: r.isOpen,
        openTime: r.openTime,
        closeTime: r.closeTime,
      })),
    };
  }
}
