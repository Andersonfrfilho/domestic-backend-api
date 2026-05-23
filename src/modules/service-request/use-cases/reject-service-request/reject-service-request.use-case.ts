import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TraceMethod } from '@adatechnology/shared';

import { type LogProviderInterface } from '@modules/shared';

import { ServiceRequestErrorFactory } from '../../factories/service-request.error.factory';
import { type ServiceRequestRepositoryInterface } from '../../service-request.repository.interface';
import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '../../service-request.token';

import { REJECT_SERVICE_REQUEST_LOG_MESSAGES } from './reject-service-request.constants';
import {
  RejectServiceRequestUseCaseInterface,
  RejectServiceRequestUseCaseParams,
  RejectServiceRequestUseCaseResponse,
} from './reject-service-request.interface';

@Injectable()
export class RejectServiceRequestUseCase implements RejectServiceRequestUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(SERVICE_REQUEST_REPOSITORY_PROVIDE)
    private readonly serviceRequestRepository: ServiceRequestRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute(
    params: RejectServiceRequestUseCaseParams,
  ): Promise<RejectServiceRequestUseCaseResponse> {
    this.logProvider.info({
      message: REJECT_SERVICE_REQUEST_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { ...params },
    });

    const serviceRequest = await this.serviceRequestRepository.findById(params.id);
    if (!serviceRequest) {
      this.logProvider.warn({
        message: REJECT_SERVICE_REQUEST_LOG_MESSAGES.NOT_FOUND,
        context: this.logContext,
        meta: { id: params.id },
      });
      throw new NotFoundException(REJECT_SERVICE_REQUEST_LOG_MESSAGES.NOT_FOUND);
    }

    if (serviceRequest.providerId !== params.providerId) {
      this.logProvider.warn({
        message: REJECT_SERVICE_REQUEST_LOG_MESSAGES.NOT_AUTHORIZED,
        context: this.logContext,
        meta: { id: params.id, providerId: params.providerId },
      });
      throw ServiceRequestErrorFactory.notAuthorized();
    }

    if (serviceRequest.status !== 'PENDING') {
      this.logProvider.warn({
        message: REJECT_SERVICE_REQUEST_LOG_MESSAGES.INVALID_STATUS,
        context: this.logContext,
        meta: { id: params.id, currentStatus: serviceRequest.status },
      });
      throw ServiceRequestErrorFactory.invalidStatusTransition(serviceRequest.status, 'REJECTED');
    }

    const result = await this.serviceRequestRepository.updateStatus(params.id, 'REJECTED');

    this.logProvider.info({
      message: REJECT_SERVICE_REQUEST_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { id: params.id },
    });

    return result;
  }
}
