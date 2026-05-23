import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';
import { TraceMethod } from '@adatechnology/shared';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { type QueueProducerMessageProviderInterface } from '@modules/shared/providers/queue/producer/producer.interface';
import { QUEUE_PRODUCER_PROVIDER } from '@modules/shared/providers/queue/producer/producer.token';

import { ProviderErrorFactory } from '../../factories/provider.error.factory';
import { type ProviderRepositoryInterface } from '../../provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';

import { APPROVE_PROVIDER_LOG_MESSAGES } from './approve-provider.constants';
import {
  ApproveProviderUseCaseInterface,
  ApproveProviderUseCaseParams,
  ApproveProviderUseCaseResponse,
} from './approve-provider.interface';

const EXCHANGE = 'zolve.events';
const ROUTING_KEY = 'provider.approved';

@Injectable()
export class ApproveProviderUseCase implements ApproveProviderUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
    @Inject(QUEUE_PRODUCER_PROVIDER)
    private readonly producer: QueueProducerMessageProviderInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute(params: ApproveProviderUseCaseParams): Promise<ApproveProviderUseCaseResponse> {
    this.logProvider.info({
      message: APPROVE_PROVIDER_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { providerId: params.providerId, reviewedBy: params.reviewedBy },
    });

    const provider = await this.providerRepository.findById(params.providerId);
    if (!provider) {
      this.logProvider.warn({
        message: APPROVE_PROVIDER_LOG_MESSAGES.PROVIDER_NOT_FOUND,
        context: this.logContext,
        meta: { providerId: params.providerId },
      });
      throw ProviderErrorFactory.notFound(params.providerId);
    }

    const verification = await this.providerRepository.getLatestVerification(params.providerId);
    if (!verification) {
      this.logProvider.warn({
        message: APPROVE_PROVIDER_LOG_MESSAGES.VERIFICATION_NOT_FOUND,
        context: this.logContext,
        meta: { providerId: params.providerId },
      });
      throw ProviderErrorFactory.verificationNotFound(params.providerId);
    }

    if (verification.status !== 'UNDER_REVIEW') {
      this.logProvider.warn({
        message: APPROVE_PROVIDER_LOG_MESSAGES.INVALID_STATUS,
        context: this.logContext,
        meta: { providerId: params.providerId, currentStatus: verification.status },
      });
      throw ProviderErrorFactory.invalidVerificationStatus(verification.status);
    }

    const updated = await this.providerRepository.updateVerification(verification.id, {
      status: 'APPROVED',
      reviewedBy: params.reviewedBy,
      notes: params.notes,
      reviewedAt: new Date(),
    });

    this.logProvider.info({
      message: APPROVE_PROVIDER_LOG_MESSAGES.APPROVED_SUCCESS,
      context: this.logContext,
      meta: { providerId: provider.id, verificationId: updated.id },
    });

    await this.producer
      .send(
        ROUTING_KEY,
        { body: { provider_id: provider.id, user_id: provider.userId } },
        { exchange: EXCHANGE, routingKey: ROUTING_KEY },
      )
      .then(() => {
        this.logProvider.info({
          message: APPROVE_PROVIDER_LOG_MESSAGES.EVENT_PUBLISHED,
          context: this.logContext,
          meta: { providerId: provider.id, routingKey: ROUTING_KEY },
        });
      })
      .catch((err: unknown) => {
        this.logProvider.warn({
          message: APPROVE_PROVIDER_LOG_MESSAGES.EVENT_PUBLISH_FAILED,
          context: this.logContext,
          meta: {
            providerId: provider.id,
            error: err instanceof Error ? err.message : String(err),
          },
        });
      });

    return updated;
  }
}
