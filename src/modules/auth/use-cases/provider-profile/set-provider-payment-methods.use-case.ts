import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { ConflictException, Inject, Injectable } from '@nestjs/common';

import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import {
  isPixDetails,
  type PaymentMethodDetails,
} from '@modules/shared/providers/database/entities/payment-method-details.types';

import { ProviderPaymentMethodRepository } from '../../repositories/provider-payment-method.repository';

import type {
  SetProviderPaymentMethodsParams,
  SetProviderPaymentMethodsResult,
  SetProviderPaymentMethodsUseCaseInterface,
} from './types';

@Injectable()
export class SetProviderPaymentMethodsUseCase implements SetProviderPaymentMethodsUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(LOGGER_PROVIDER) private readonly logProvider: LogProviderInterface,
    private readonly paymentMethodRepo: ProviderPaymentMethodRepository,
  ) {}

  @TraceMethod()
  async execute(params: SetProviderPaymentMethodsParams): Promise<SetProviderPaymentMethodsResult> {
    this.logProvider.info({
      message: 'Setting provider payment methods',
      context: this.logContext,
      meta: { providerId: params.providerId, count: params.methods.length },
    });

    try {
      for (const method of params.methods) {
        const details = (method.details ?? null) as PaymentMethodDetails | null;
        if (details && isPixDetails(details)) {
          const taken = await this.paymentMethodRepo.findDuplicatePixKey(
            details.pixKey,
            params.providerId,
          );
          if (taken) {
            throw new ConflictException(
              `Chave PIX "${details.pixKey}" já está em uso por outro prestador`,
            );
          }
        }
      }

      await this.paymentMethodRepo.replaceForProvider(
        params.providerId,
        params.methods.map((method) => ({
          paymentMethodTypeId: method.paymentMethodTypeId,
          details: (method.details ?? null) as PaymentMethodDetails | null,
        })),
      );

      this.logProvider.info({
        message: 'Provider payment methods updated',
        context: this.logContext,
        meta: { providerId: params.providerId },
      });

      return { success: true };
    } catch (error) {
      this.logProvider.error({
        message: 'Failed to set provider payment methods',
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
