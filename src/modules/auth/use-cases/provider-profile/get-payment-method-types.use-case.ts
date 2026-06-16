import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable } from '@nestjs/common';

import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { ProviderPaymentMethodRepository } from '../../repositories/provider-payment-method.repository';

import type { GetPaymentMethodTypesResult, GetPaymentMethodTypesUseCaseInterface } from './types';

@Injectable()
export class GetPaymentMethodTypesUseCase implements GetPaymentMethodTypesUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(LOGGER_PROVIDER) private readonly logProvider: LogProviderInterface,
    private readonly paymentMethodRepo: ProviderPaymentMethodRepository,
  ) {}

  @TraceMethod()
  async execute(): Promise<GetPaymentMethodTypesResult> {
    this.logProvider.info({ message: 'Getting payment method types', context: this.logContext });

    try {
      const types = await this.paymentMethodRepo.findAllTypes();

      return {
        success: true,
        data: types.map((type) => ({
          id: type.id,
          name: type.name,
          label: type.label,
          icon: type.icon,
        })),
      };
    } catch (error) {
      this.logProvider.error({
        message: 'Failed to get payment method types',
        context: this.logContext,
        meta: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }
}
