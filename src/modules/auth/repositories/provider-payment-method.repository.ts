import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { PaymentMethodDetails } from '@modules/shared/providers/database/entities/payment-method-details.types';
import { PaymentMethodType } from '@modules/shared/providers/database/entities/payment-method-type.entity';
import { ProviderPaymentMethod } from '@modules/shared/providers/database/entities/provider-payment-method.entity';

export type ProviderPaymentMethodEntry = {
  paymentMethodTypeId: string;
  details: PaymentMethodDetails | null;
};

@Injectable()
export class ProviderPaymentMethodRepository {
  constructor(
    @InjectRepository(PaymentMethodType, 'postgres')
    private readonly paymentMethodTypeRepo: Repository<PaymentMethodType>,
    @InjectRepository(ProviderPaymentMethod, 'postgres')
    private readonly providerPaymentMethodRepo: Repository<ProviderPaymentMethod>,
  ) {}

  async findAllTypes(): Promise<PaymentMethodType[]> {
    return this.paymentMethodTypeRepo.find({ where: { isEnabled: true } });
  }

  async findByProviderId(providerId: string): Promise<ProviderPaymentMethod[]> {
    return this.providerPaymentMethodRepo.find({
      where: { providerId, isEnabled: true },
      relations: ['paymentMethodType'],
    });
  }

  async findDuplicatePixKey(pixKey: string, excludeProviderId: string): Promise<boolean> {
    const count = await this.providerPaymentMethodRepo
      .createQueryBuilder('ppm')
      .where("ppm.details->>'pixKey' = :pixKey", { pixKey })
      .andWhere('ppm.providerId != :providerId', { providerId: excludeProviderId })
      .getCount();
    return count > 0;
  }

  async replaceForProvider(
    providerId: string,
    methods: ProviderPaymentMethodEntry[],
  ): Promise<void> {
    await this.providerPaymentMethodRepo.delete({ providerId });

    if (methods.length === 0) return;

    const entities = methods.map(({ paymentMethodTypeId, details }) =>
      this.providerPaymentMethodRepo.create({
        providerId,
        paymentMethodTypeId,
        isEnabled: true,
        details: details ?? null,
      }),
    );
    await this.providerPaymentMethodRepo.save(entities);
  }
}
