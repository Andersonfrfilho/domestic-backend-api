import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { ProviderErrorFactory } from '../../factories/provider.error.factory';
import { type ProviderRepositoryInterface } from '../../provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';

import { SUBMIT_VERIFICATION_LOG_MESSAGES } from './submit-verification.constants';
import {
  SubmitVerificationUseCaseInterface,
  SubmitVerificationUseCaseParams,
  SubmitVerificationUseCaseResponse,
} from './submit-verification.interface';

@Injectable()
export class SubmitVerificationUseCase implements SubmitVerificationUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(
    params: SubmitVerificationUseCaseParams,
  ): Promise<SubmitVerificationUseCaseResponse> {
    this.logProvider.info({
      message: SUBMIT_VERIFICATION_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { providerId: params.providerId },
    });

    const provider = await this.providerRepository.findById(params.providerId);
    if (!provider) {
      this.logProvider.warn({
        message: SUBMIT_VERIFICATION_LOG_MESSAGES.PROVIDER_NOT_FOUND,
        context: this.logContext,
        meta: { providerId: params.providerId },
      });
      throw ProviderErrorFactory.notFound(params.providerId);
    }

    const verification = await this.providerRepository.getLatestVerification(params.providerId);
    if (!verification) {
      this.logProvider.warn({
        message: SUBMIT_VERIFICATION_LOG_MESSAGES.VERIFICATION_NOT_FOUND,
        context: this.logContext,
        meta: { providerId: params.providerId },
      });
      throw ProviderErrorFactory.verificationNotFound(params.providerId);
    }

    if (verification.status !== 'PENDING') {
      this.logProvider.warn({
        message: SUBMIT_VERIFICATION_LOG_MESSAGES.INVALID_STATUS,
        context: this.logContext,
        meta: { providerId: params.providerId, currentStatus: verification.status },
      });
      throw ProviderErrorFactory.invalidVerificationStatus(verification.status);
    }

    const updated = await this.providerRepository.updateVerification(verification.id, {
      status: 'UNDER_REVIEW',
    });

    this.logProvider.info({
      message: SUBMIT_VERIFICATION_LOG_MESSAGES.SUBMITTED_SUCCESS,
      context: this.logContext,
      meta: { providerId: params.providerId, verificationId: updated.id },
    });

    return updated;
  }
}
