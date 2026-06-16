import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { type LogProviderInterface } from '@modules/shared';
import { type QueueProducerMessageProviderInterface } from '@modules/shared/providers/queue/producer/producer.interface';
import { QUEUE_PRODUCER_PROVIDER } from '@modules/shared/providers/queue/producer/producer.token';

import { ServiceRequestErrorFactory } from '../../factories/service-request.error.factory';
import { type ServiceRequestRepositoryInterface } from '../../service-request.repository.interface';
import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '../../service-request.token';

import { REJECT_SERVICE_REQUEST_LOG_MESSAGES } from './reject-service-request.constants';
import {
  RejectServiceRequestUseCaseInterface,
  RejectServiceRequestUseCaseParams,
  RejectServiceRequestUseCaseResponse,
} from './reject-service-request.interface';

const EXCHANGE = 'zolve.events';
const ROUTING_KEY = 'service_request.rejected';

@Injectable()
export class RejectServiceRequestUseCase implements RejectServiceRequestUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(SERVICE_REQUEST_REPOSITORY_PROVIDE)
    private readonly serviceRequestRepository: ServiceRequestRepositoryInterface,
    @Inject(QUEUE_PRODUCER_PROVIDER)
    private readonly producer: QueueProducerMessageProviderInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

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

    const notification = await this.serviceRequestRepository.findForNotification(params.id);
    if (notification) {
      await this.producer
        .send(
          ROUTING_KEY,
          {
            body: {
              event_type: 'rejected',
              request_id: notification.id,
              contractor_id: notification.contractorId,
              contractor_user_id: notification.contractorUserId,
              contractor_email: notification.contractorEmail,
              contractor_fcm_token: notification.contractorFcmToken,
              provider_id: notification.providerId,
              provider_user_id: notification.providerUserId,
              provider_email: notification.providerEmail,
              provider_fcm_token: notification.providerFcmToken,
              service_name: notification.serviceName,
              scheduled_at: notification.scheduledAt,
            },
          },
          { exchange: EXCHANGE, routingKey: ROUTING_KEY },
        )
        .catch((error) => {
          this.logProvider.error({
            message: REJECT_SERVICE_REQUEST_LOG_MESSAGES.QUEUE_ERROR,
            context: this.logContext,
            meta: { id: params.id, error },
          });
        });
    }

    this.logProvider.info({
      message: REJECT_SERVICE_REQUEST_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { id: params.id },
    });

    return result;
  }
}
