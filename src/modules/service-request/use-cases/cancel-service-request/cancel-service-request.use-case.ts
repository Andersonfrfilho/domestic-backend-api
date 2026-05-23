import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TraceMethod } from '@adatechnology/logger';

import { type LogProviderInterface } from '@modules/shared';

import { ServiceRequestErrorFactory } from '../../factories/service-request.error.factory';
import { type ServiceRequestRepositoryInterface } from '../../service-request.repository.interface';
import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '../../service-request.token';

import { CANCEL_SERVICE_REQUEST_LOG_MESSAGES } from './cancel-service-request.constants';
import {
  CancelServiceRequestUseCaseInterface,
  CancelServiceRequestUseCaseParams,
  CancelServiceRequestUseCaseResponse,
} from './cancel-service-request.interface';

const CANCELLABLE_STATUSES = new Set(['PENDING', 'ACCEPTED']);

@Injectable()
export class CancelServiceRequestUseCase implements CancelServiceRequestUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(SERVICE_REQUEST_REPOSITORY_PROVIDE)
    private readonly serviceRequestRepository: ServiceRequestRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute(
    params: CancelServiceRequestUseCaseParams,
  ): Promise<CancelServiceRequestUseCaseResponse> {
    this.logProvider.info({
      message: CANCEL_SERVICE_REQUEST_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { ...params },
    });

    const serviceRequest = await this.serviceRequestRepository.findById(params.id);
    if (!serviceRequest) {
      this.logProvider.warn({
        message: CANCEL_SERVICE_REQUEST_LOG_MESSAGES.NOT_FOUND,
        context: this.logContext,
        meta: { id: params.id },
      });
      throw new NotFoundException(CANCEL_SERVICE_REQUEST_LOG_MESSAGES.NOT_FOUND);
    }

    if (serviceRequest.contractorId !== params.contractorId) {
      this.logProvider.warn({
        message: CANCEL_SERVICE_REQUEST_LOG_MESSAGES.NOT_AUTHORIZED,
        context: this.logContext,
        meta: { id: params.id, contractorId: params.contractorId },
      });
      throw ServiceRequestErrorFactory.notAuthorized();
    }

    if (!CANCELLABLE_STATUSES.has(serviceRequest.status)) {
      this.logProvider.warn({
        message: CANCEL_SERVICE_REQUEST_LOG_MESSAGES.INVALID_STATUS,
        context: this.logContext,
        meta: { id: params.id, currentStatus: serviceRequest.status },
      });
      throw ServiceRequestErrorFactory.invalidStatusTransition(serviceRequest.status, 'CANCELLED');
    }

    const result = await this.serviceRequestRepository.updateStatus(params.id, 'CANCELLED');

    this.logProvider.info({
      message: CANCEL_SERVICE_REQUEST_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { id: params.id },
    });

    return result;
  }
}
