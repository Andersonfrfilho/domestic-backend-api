import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { type ProviderRepositoryInterface } from '../../provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';
import { ProviderErrorFactory } from '../../factories/provider.error.factory';

import { GET_PROVIDER_VERIFICATION_LOG_MESSAGES } from './get-provider-verification.constants';
import {
  GetProviderVerificationUseCaseInterface,
  GetProviderVerificationUseCaseParams,
  GetProviderVerificationUseCaseResponse,
} from './get-provider-verification.interface';

@Injectable()
export class GetProviderVerificationUseCase implements GetProviderVerificationUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: GetProviderVerificationUseCaseParams): Promise<GetProviderVerificationUseCaseResponse> {
    this.logProvider.info({
      message: GET_PROVIDER_VERIFICATION_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { providerId: params.providerId },
    });

    const provider = await this.providerRepository.findById(params.providerId);
    if (!provider) {
      this.logProvider.warn({
        message: GET_PROVIDER_VERIFICATION_LOG_MESSAGES.PROVIDER_NOT_FOUND,
        context: this.logContext,
        meta: { providerId: params.providerId },
      });
      throw ProviderErrorFactory.notFound(params.providerId);
    }

    const verification = await this.providerRepository.getLatestVerification(params.providerId);
    if (!verification) {
      this.logProvider.warn({
        message: GET_PROVIDER_VERIFICATION_LOG_MESSAGES.VERIFICATION_NOT_FOUND,
        context: this.logContext,
        meta: { providerId: params.providerId },
      });
      throw ProviderErrorFactory.verificationNotFound(params.providerId);
    }

    this.logProvider.info({
      message: GET_PROVIDER_VERIFICATION_LOG_MESSAGES.VERIFICATION_FOUND,
      context: this.logContext,
      meta: { providerId: params.providerId, verificationId: verification.id, status: verification.status },
    });

    return verification;
  }
}
