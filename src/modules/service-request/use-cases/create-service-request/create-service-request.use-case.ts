import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable } from '@nestjs/common';

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

  async execute(
    params: CreateServiceRequestUseCaseParams,
  ): Promise<CreateServiceRequestUseCaseResponse> {
    this.logProvider.info({
      message: CREATE_SERVICE_REQUEST_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { ...params },
    });

    const [verification, provider] = await Promise.all([
      this.providerRepository.getLatestVerification(params.providerId),
      this.providerRepository.findById(params.providerId),
    ]);

    if (verification?.status !== 'APPROVED') {
      this.logProvider.warn({
        message: CREATE_SERVICE_REQUEST_LOG_MESSAGES.PROVIDER_NOT_APPROVED,
        context: this.logContext,
        meta: { providerId: params.providerId },
      });
      throw ServiceRequestErrorFactory.providerNotApproved(params.providerId);
    }

    if (provider?.userId === params.contractorId) {
      this.logProvider.warn({
        message: CREATE_SERVICE_REQUEST_LOG_MESSAGES.SELF_HIRING_ATTEMPT,
        context: this.logContext,
        meta: { contractorId: params.contractorId, providerId: params.providerId },
      });
      throw ServiceRequestErrorFactory.selfHiring();
    }

    if (params.scheduledAt) {
      const conflict = await this.serviceRequestRepository.findConflictingRequest({
        providerId: params.providerId,
        scheduledAt: params.scheduledAt,
        estimatedHours: params.estimatedHours,
      });

      if (conflict) {
        this.logProvider.warn({
          message: CREATE_SERVICE_REQUEST_LOG_MESSAGES.TIME_CONFLICT,
          context: this.logContext,
          meta: {
            providerId: params.providerId,
            scheduledAt: params.scheduledAt,
            conflictingRequestId: conflict.id,
          },
        });
        throw ServiceRequestErrorFactory.timeConflict(
          params.providerId,
          params.scheduledAt.toISOString(),
        );
      }
    }

    const serviceRequest = await this.serviceRequestRepository.create(params);

    const notification = await this.serviceRequestRepository.findForNotification(serviceRequest.id);
    if (notification) {
      await this.producer
        .send(
          ROUTING_KEY,
          {
            body: {
              event_type: 'created',
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
            message: CREATE_SERVICE_REQUEST_LOG_MESSAGES.QUEUE_ERROR,
            context: this.logContext,
            meta: { id: serviceRequest.id, error },
          });
        });
    }

    this.logProvider.info({
      message: CREATE_SERVICE_REQUEST_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { id: serviceRequest?.id },
    });

    return serviceRequest;
  }
}
