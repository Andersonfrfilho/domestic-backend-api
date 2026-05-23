import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';
import { TraceMethod } from '@adatechnology/shared';

import { type LogProviderInterface } from '@modules/shared';

import { type ServiceRequestRepositoryInterface } from '../../service-request.repository.interface';
import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '../../service-request.token';

import { LIST_SERVICE_REQUESTS_BY_USER_LOG_MESSAGES } from './list-service-requests-by-user.constants';
import {
  ListServiceRequestsByUserUseCaseInterface,
  ListServiceRequestsByUserUseCaseParams,
  ListServiceRequestsByUserUseCaseResponse,
} from './list-service-requests-by-user.interface';

@Injectable()
export class ListServiceRequestsByUserUseCase implements ListServiceRequestsByUserUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(SERVICE_REQUEST_REPOSITORY_PROVIDE)
    private readonly serviceRequestRepository: ServiceRequestRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute(
    params: ListServiceRequestsByUserUseCaseParams,
  ): Promise<ListServiceRequestsByUserUseCaseResponse> {
    this.logProvider.info({
      message: LIST_SERVICE_REQUESTS_BY_USER_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { ...params },
    });

    const serviceRequests = await this.serviceRequestRepository.listByContractor(
      params.contractorId,
    );

    this.logProvider.info({
      message: LIST_SERVICE_REQUESTS_BY_USER_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: {
        contractorId: params.contractorId,
        count: serviceRequests.length,
      },
    });

    return serviceRequests;
  }
}
