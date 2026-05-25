import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { type LogProviderInterface } from '@modules/shared';

import { ServiceRequestErrorFactory } from '../../factories/service-request.error.factory';
import { type ServiceRequestRepositoryInterface } from '../../service-request.repository.interface';
import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '../../service-request.token';

import { ACCEPT_SERVICE_REQUEST_LOG_MESSAGES } from './accept-service-request.constants';
import {
  AcceptServiceRequestUseCaseInterface,
  AcceptServiceRequestUseCaseParams,
  AcceptServiceRequestUseCaseResponse,
} from './accept-service-request.interface';

@Injectable()
export class AcceptServiceRequestUseCase implements AcceptServiceRequestUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(SERVICE_REQUEST_REPOSITORY_PROVIDE)
    private readonly serviceRequestRepository: ServiceRequestRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(
    params: AcceptServiceRequestUseCaseParams,
  ): Promise<AcceptServiceRequestUseCaseResponse> {
    this.logProvider.info({
      message: ACCEPT_SERVICE_REQUEST_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { ...params },
    });

    const serviceRequest = await this.serviceRequestRepository.findById(params.id);
    if (!serviceRequest) {
      this.logProvider.warn({
        message: ACCEPT_SERVICE_REQUEST_LOG_MESSAGES.NOT_FOUND,
        context: this.logContext,
        meta: { id: params.id },
      });
      throw new NotFoundException(ACCEPT_SERVICE_REQUEST_LOG_MESSAGES.NOT_FOUND);
    }

    if (serviceRequest.providerId !== params.providerId) {
      this.logProvider.warn({
        message: ACCEPT_SERVICE_REQUEST_LOG_MESSAGES.NOT_AUTHORIZED,
        context: this.logContext,
        meta: { id: params.id, providerId: params.providerId },
      });
      throw ServiceRequestErrorFactory.notAuthorized();
    }

    if (serviceRequest.status !== 'PENDING') {
      this.logProvider.warn({
        message: ACCEPT_SERVICE_REQUEST_LOG_MESSAGES.INVALID_STATUS,
        context: this.logContext,
        meta: { id: params.id, currentStatus: serviceRequest.status },
      });
      throw ServiceRequestErrorFactory.invalidStatusTransition(serviceRequest.status, 'ACCEPTED');
    }

    const result = await this.serviceRequestRepository.updateStatus(params.id, 'ACCEPTED');

    this.logProvider.info({
      message: ACCEPT_SERVICE_REQUEST_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { id: params.id },
    });

    return result;
  }
}
