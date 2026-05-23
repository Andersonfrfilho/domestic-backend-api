import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { type LogProviderInterface } from '@modules/shared';

import { type ServiceRequestRepositoryInterface } from '../../service-request.repository.interface';
import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '../../service-request.token';

import { GET_SERVICE_REQUEST_BY_ID_LOG_MESSAGES } from './get-service-request-by-id.constants';
import {
  GetServiceRequestByIdUseCaseInterface,
  GetServiceRequestByIdUseCaseParams,
  GetServiceRequestByIdUseCaseResponse,
} from './get-service-request-by-id.interface';

@Injectable()
export class GetServiceRequestByIdUseCase implements GetServiceRequestByIdUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(SERVICE_REQUEST_REPOSITORY_PROVIDE)
    private readonly serviceRequestRepository: ServiceRequestRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(
    params: GetServiceRequestByIdUseCaseParams,
  ): Promise<GetServiceRequestByIdUseCaseResponse> {
    this.logProvider.info({
      message: GET_SERVICE_REQUEST_BY_ID_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { ...params },
    });

    const serviceRequest = await this.serviceRequestRepository.findById(params.id);
    if (!serviceRequest) {
      this.logProvider.warn({
        message: GET_SERVICE_REQUEST_BY_ID_LOG_MESSAGES.NOT_FOUND,
        context: this.logContext,
        meta: { id: params.id },
      });
      throw new NotFoundException(GET_SERVICE_REQUEST_BY_ID_LOG_MESSAGES.NOT_FOUND);
    }

    this.logProvider.info({
      message: GET_SERVICE_REQUEST_BY_ID_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { id: params.id },
    });

    return serviceRequest;
  }
}
