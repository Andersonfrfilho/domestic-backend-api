import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import { type LogProviderInterface } from '@modules/shared';

import { type ReviewRepositoryInterface } from '../../review.repository.interface';
import { REVIEW_REPOSITORY_PROVIDE } from '../../review.token';

import {
  LIST_REVIEWS_BY_PROVIDER_LOG_CONTEXT,
  LIST_REVIEWS_BY_PROVIDER_LOG_MESSAGES,
} from './list-reviews-by-provider.constants';
import {
  ListReviewsByProviderUseCaseInterface,
  ListReviewsByProviderUseCaseParams,
  ListReviewsByProviderUseCaseResponse,
} from './list-reviews-by-provider.interface';

@Injectable()
export class ListReviewsByProviderUseCase implements ListReviewsByProviderUseCaseInterface {
  private readonly logContext = LIST_REVIEWS_BY_PROVIDER_LOG_CONTEXT;

  constructor(
    @Inject(REVIEW_REPOSITORY_PROVIDE)
    private readonly reviewRepository: ReviewRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(
    params: ListReviewsByProviderUseCaseParams,
  ): Promise<ListReviewsByProviderUseCaseResponse> {
    this.logProvider.info({
      message: LIST_REVIEWS_BY_PROVIDER_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { ...params },
    });

    const reviews = await this.reviewRepository.listByProvider(params.providerId);

    this.logProvider.info({
      message: LIST_REVIEWS_BY_PROVIDER_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { providerId: params.providerId, count: reviews.length },
    });

    return reviews;
  }
}
