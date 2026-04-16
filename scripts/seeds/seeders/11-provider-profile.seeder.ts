import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { ProviderProfile } from '@app/modules/shared/providers/database/entities/provider-profile.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

export async function seedProviderProfiles(ds: DataSource, ctx: SeedContext, cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(ProviderProfile);

  const providerCount = Math.round(cfg.users * cfg.providersRatio);
  // Pick the first N users as providers
  const providerUsers = ctx.users.slice(0, providerCount);

  const entities: ProviderProfile[] = [];

  for (const user of providerUsers) {
    entities.push(
      repo.create({
        userId: user.id,
        businessName: faker.company.name(),
        description: faker.lorem.paragraph(),
        averageRating: parseFloat(faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }).toFixed(1)),
        isAvailable: faker.datatype.boolean({ probability: 0.8 }),
      }),
    );
  }

  ctx.providers = await repo.save(entities);
}
