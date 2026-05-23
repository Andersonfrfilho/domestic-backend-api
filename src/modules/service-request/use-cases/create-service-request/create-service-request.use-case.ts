import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';
import { TraceMethod } from '@adatechnology/logger';

import { type ProviderRepositoryInterface } from '@modules/provider/provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '@modules/provider/provider.token';
import { type LogProviderInterface } from '@modules/shared';
import { type QueueProducerMessageProviderInterface } from '@modules/shared/providers/queue/producer/producer.interface';
import { QUEUE_PRODUCER_PROVIDER } from '@modules/shared/providers/queue/producer/producer.token';

import { ServiceRequestErrorFactory } from '../../factories/service-request.error.factory';
import { type ServiceRequestRepositoryInterface } from '../../service-request.repository.interface';
import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '../../service-request.token';

import { CREATE_SERVICE_REQUEST_LOG_MESSAGES } from './create-service-request.constants';
import {
  CreateServiceRequestUseCaseInterface,
  CreateServiceRequestUseCaseParams,
  CreateServiceRequestUseCaseResponse,
} from './create-service-request.interface';

const EXCHANGE = 'zolve.events';
const ROUTING_KEY = 'service_request.created';

@Injectable()
export class CreateServiceRequestUseCase implements CreateServiceRequestUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(SERVICE_REQUEST_REPOSITORY_PROVIDE)
    private readonly serviceRequestRepository: ServiceRequestRepositoryInterface,
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
    @Inject(QUEUE_PRODUCER_PROVIDER)
    private readonly producer: QueueProducerMessageProviderInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute(
    params: CreateServiceRequestUseCaseParams,
  ): Promise<CreateServiceRequestUseCaseResponse> {
    this.logProvider.info({
      message: CREATE_SERVICE_REQUEST_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { ...params },
    });

    const verification = await this.providerRepository.getLatestVerification(params.providerId);
    if (verification?.status !== 'APPROVED') {
      this.logProvider.warn({
        message: CREATE_SERVICE_REQUEST_LOG_MESSAGES.PROVIDER_NOT_APPROVED,
        context: this.logContext,
        meta: { providerId: params.providerId },
      });
      throw ServiceRequestErrorFactory.providerNotApproved(params.providerId);
    }

    const serviceRequest = await this.serviceRequestRepository.create(params);

    await this.producer
      .send(
        ROUTING_KEY,
        {
          body: {
            service_request_id: serviceRequest?.id,
            contractor_id: serviceRequest?.contractorId,
            provider_id: serviceRequest?.providerId,
            service_id: serviceRequest?.serviceId,
          },
        },
        { exchange: EXCHANGE, routingKey: ROUTING_KEY },
      )
      .catch((error) => {
        this.logProvider.error({
          message: CREATE_SERVICE_REQUEST_LOG_MESSAGES.QUEUE_ERROR,
          context: this.logContext,
          meta: { id: serviceRequest?.id, error },
        });
      });

    this.logProvider.info({
      message: CREATE_SERVICE_REQUEST_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { id: serviceRequest?.id },
    });

    return serviceRequest;
  }
}
