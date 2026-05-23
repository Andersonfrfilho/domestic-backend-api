import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import { type ServiceRequestRepositoryInterface } from '@modules/service-request/service-request.repository.interface';
import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '@modules/service-request/service-request.token';
import { type LogProviderInterface } from '@modules/shared';

import { ReviewErrorFactory } from '../../factories/review.error.factory';
import { type ReviewRepositoryInterface } from '../../review.repository.interface';
import { REVIEW_REPOSITORY_PROVIDE } from '../../review.token';

import { CREATE_REVIEW_LOG_MESSAGES } from './create-review.constants';
import {
  CreateReviewUseCaseInterface,
  CreateReviewUseCaseParams,
  CreateReviewUseCaseResponse,
} from './create-review.interface';

@Injectable()
export class CreateReviewUseCase implements CreateReviewUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(REVIEW_REPOSITORY_PROVIDE)
    private readonly reviewRepository: ReviewRepositoryInterface,
    @Inject(SERVICE_REQUEST_REPOSITORY_PROVIDE)
    private readonly serviceRequestRepository: ServiceRequestRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: CreateReviewUseCaseParams): Promise<CreateReviewUseCaseResponse> {
    this.logProvider.info({
      message: CREATE_REVIEW_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { ...params },
    });

    const serviceRequest = await this.serviceRequestRepository.findById(params.serviceRequestId);
    if (serviceRequest?.status !== 'COMPLETED') {
      this.logProvider.warn({
        message: CREATE_REVIEW_LOG_MESSAGES.SERVICE_REQUEST_NOT_COMPLETED,
        context: this.logContext,
        meta: { serviceRequestId: params.serviceRequestId },
      });
      throw ReviewErrorFactory.serviceRequestNotCompleted(params.serviceRequestId);
    }

    const existing = await this.reviewRepository.findByServiceRequestId(params.serviceRequestId);
    if (existing) {
      this.logProvider.warn({
        message: CREATE_REVIEW_LOG_MESSAGES.ALREADY_EXISTS,
        context: this.logContext,
        meta: { serviceRequestId: params.serviceRequestId },
      });
      throw ReviewErrorFactory.alreadyExists(params.serviceRequestId);
    }

    const result = await this.reviewRepository.create({
      serviceRequestId: params.serviceRequestId,
      contractorId: params.contractorId,
      providerId: serviceRequest.providerId,
      rating: params.rating,
      comment: params.comment,
    });

    this.logProvider.info({
      message: CREATE_REVIEW_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { reviewId: result.id },
    });

    return result;
  }
}
