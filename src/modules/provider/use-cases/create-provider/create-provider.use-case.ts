import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { ProviderErrorFactory } from '../../factories/provider.error.factory';
import { type ProviderRepositoryInterface } from '../../provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '../../provider.token';

import { CREATE_PROVIDER_LOG_MESSAGES } from './create-provider.constants';
import {
  CreateProviderUseCaseInterface,
  CreateProviderUseCaseParams,
  CreateProviderUseCaseResponse,
} from './create-provider.interface';

@Injectable()
export class CreateProviderUseCase implements CreateProviderUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: CreateProviderUseCaseParams): Promise<CreateProviderUseCaseResponse> {
    this.logProvider.info({
      message: CREATE_PROVIDER_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { userId: params.userId },
    });

    const existing = await this.providerRepository.findByUserId(params.userId);
    if (existing) {
      this.logProvider.warn({
        message: CREATE_PROVIDER_LOG_MESSAGES.PROVIDER_ALREADY_EXISTS,
        context: this.logContext,
        meta: { userId: params.userId, providerId: existing.id },
      });
      throw ProviderErrorFactory.alreadyExists(params.userId);
    }

    const provider = await this.providerRepository.create(params);

    this.logProvider.info({
      message: CREATE_PROVIDER_LOG_MESSAGES.PROVIDER_CREATED,
      context: this.logContext,
      meta: { providerId: provider.id, userId: provider.userId },
    });

    await this.providerRepository.createVerification({
      providerId: provider.id,
      status: 'PENDING',
    });

    this.logProvider.info({
      message: CREATE_PROVIDER_LOG_MESSAGES.VERIFICATION_CREATED,
      context: this.logContext,
      meta: { providerId: provider.id },
    });

    return provider;
  }
}
