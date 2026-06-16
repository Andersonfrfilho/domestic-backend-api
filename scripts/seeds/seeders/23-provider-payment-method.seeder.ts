import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { ProviderPaymentMethod } from '@app/modules/shared/providers/database/entities/provider-payment-method.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

export async function seedProviderPaymentMethods(
  ds: DataSource,
  ctx: SeedContext,
  _cfg: SeedConfig,
): Promise<void> {
  const repo = ds.getRepository(ProviderPaymentMethod);

  const typeRows = await ds.query<{ id: string; name: string }[]>(
    `SELECT id, name FROM payment_method_types WHERE is_enabled = true`,
  );

  if (typeRows.length === 0 || ctx.providers.length === 0) return;

  const entities: ProviderPaymentMethod[] = [];

  for (const provider of ctx.providers) {
    const assigned = faker.helpers.arrayElements(typeRows, {
      min: 1,
      max: Math.min(typeRows.length, 3),
    });

    for (const type of assigned) {
      entities.push(
        repo.create({
          providerId: provider.id,
          paymentMethodTypeId: type.id,
          isEnabled: true,
        }),
      );
    }
  }

  await repo.save(entities);
  ctx.providerPaymentMethods = entities;
}
