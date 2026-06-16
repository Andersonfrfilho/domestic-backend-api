import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable } from '@nestjs/common';

import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { ProviderPaymentMethodRepository } from '../../repositories/provider-payment-method.repository';

import type {
  CheckPixKeyAvailabilityParams,
  CheckPixKeyAvailabilityResult,
  CheckPixKeyAvailabilityUseCaseInterface,
} from './types';

@Injectable()
export class CheckPixKeyAvailabilityUseCase implements CheckPixKeyAvailabilityUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(LOGGER_PROVIDER) private readonly logProvider: LogProviderInterface,
    private readonly paymentMethodRepo: ProviderPaymentMethodRepository,
  ) {}

  @TraceMethod()
  async execute(params: CheckPixKeyAvailabilityParams): Promise<CheckPixKeyAvailabilityResult> {
    this.logProvider.info({
      message: 'Checking PIX key availability',
      context: this.logContext,
      meta: { providerId: params.providerId },
    });

    const taken = await this.paymentMethodRepo.findDuplicatePixKey(
      params.pixKey,
      params.providerId,
    );

    return { available: !taken };
  }
}
