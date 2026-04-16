import { DataSource } from 'typeorm';

import { ProviderAddress } from '@app/modules/shared/providers/database/entities/provider-address.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

export async function seedProviderAddresses(ds: DataSource, ctx: SeedContext, cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(ProviderAddress);

  // Provider addresses use the extra addresses allocated after the user addresses
  // users * 2 addresses were used for users, remaining are for providers
  const providerAddressOffset = cfg.users * 2;
  const entities: ProviderAddress[] = [];

  for (let i = 0; i < ctx.providers.length; i++) {
    const provider = ctx.providers[i];
    const address = ctx.addresses[providerAddressOffset + i] ?? ctx.addresses[i];

    entities.push(
      repo.create({
        providerId: provider.id,
        addressId: address.id,
        label: 'sede comercial',
        isPrimary: true,
      }),
    );
  }

  ctx.providerAddresses = await repo.save(entities);
}
