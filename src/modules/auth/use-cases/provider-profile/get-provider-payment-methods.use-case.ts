import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable } from '@nestjs/common';

import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { ProviderPaymentMethodRepository } from '../../repositories/provider-payment-method.repository';

import type {
  GetProviderPaymentMethodsParams,
  GetProviderPaymentMethodsResult,
  GetProviderPaymentMethodsUseCaseInterface,
} from './types';

@Injectable()
export class GetProviderPaymentMethodsUseCase implements GetProviderPaymentMethodsUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(LOGGER_PROVIDER) private readonly logProvider: LogProviderInterface,
    private readonly paymentMethodRepo: ProviderPaymentMethodRepository,
  ) {}

  @TraceMethod()
  async execute(params: GetProviderPaymentMethodsParams): Promise<GetProviderPaymentMethodsResult> {
    this.logProvider.info({
      message: 'Getting provider payment methods',
      context: this.logContext,
      meta: { providerId: params.providerId },
    });

    try {
      const rows = await this.paymentMethodRepo.findByProviderId(params.providerId);

      return {
        success: true,
        data: rows.map((row) => ({
          id: row.id,
          paymentMethodTypeId: row.paymentMethodTypeId,
          name: row.paymentMethodType.name,
          label: row.paymentMethodType.label,
          icon: row.paymentMethodType.icon,
          isEnabled: row.isEnabled,
          details: row.details as Record<string, string> | null,
        })),
      };
    } catch (error) {
      this.logProvider.error({
        message: 'Failed to get provider payment methods',
        context: this.logContext,
        meta: {
          providerId: params.providerId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }
}
