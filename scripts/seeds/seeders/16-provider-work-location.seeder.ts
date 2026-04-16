import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { ProviderWorkLocation } from '@app/modules/shared/providers/database/entities/provider-work-location.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

export async function seedProviderWorkLocations(ds: DataSource, ctx: SeedContext, _cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(ProviderWorkLocation);

  const entities: ProviderWorkLocation[] = [];

  for (let i = 0; i < ctx.providers.length; i++) {
    const provider = ctx.providers[i];
    // Reuse the provider's own address for work location
    const address = ctx.providerAddresses[i];
    if (!address) continue;

    entities.push(
      repo.create({
        providerId: provider.id,
        addressId: address.addressId,
        name: faker.helpers.arrayElement(['Escritório Principal', 'Sede', 'Filial Centro', 'Base Operacional']),
        isPrimary: true,
        isActive: true,
      }),
    );
  }

  ctx.providerWorkLocations = await repo.save(entities);
}
