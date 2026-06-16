import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { ProviderProfile } from '@app/modules/shared/providers/database/entities/provider-profile.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

// Fixed provider data for deterministic test scenarios.
// Indices reference ctx.users which mirrors KEYCLOAK_TEST_USERS order:
//   users[0] = contractor-test  → NOT a provider
//   users[1] = provider-test    → provider, pending verification
//   users[2] = provider-full    → provider, approved verification
//   users[3] = admin-test       → NOT a provider
//   users[4..] = random users   → some become providers
const FIXED_PROVIDERS = [
  {
    businessName: 'Provider Test Serviços',
    description: 'Prestador em processo de verificação. Perfil ainda pendente de aprovação.',
    averageRating: 0,
    isAvailable: false,
    avatarUrl: 'https://picsum.photos/seed/provider-test/200',
  },
  {
    businessName: 'Provider Full Serviços Gerais',
    description: 'Prestador verificado e aprovado. Atende limpeza, reparos e jardinagem na região de São Paulo.',
    averageRating: 4.8,
    isAvailable: true,
    avatarUrl: 'https://picsum.photos/seed/provider-full/200',
  },
];

export async function seedProviderProfiles(ds: DataSource, ctx: SeedContext, cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(ProviderProfile);

  const entities: ProviderProfile[] = [];

  // Create fixed providers (users[1] = provider-test, users[2] = provider-full)
  for (let i = 0; i < FIXED_PROVIDERS.length; i++) {
    const user = ctx.users[i + 1]; // skip users[0] (contractor) and users[3] (admin)
    if (!user) continue;
    entities.push(repo.create({ userId: user.id, ...FIXED_PROVIDERS[i] }));
  }

  // Fill remaining provider slots from random users (starting at users[4], after admin-test)
  const providerCount = Math.round(cfg.users * cfg.providersRatio);
  const remainingSlots = Math.max(0, providerCount - FIXED_PROVIDERS.length);
  const randomUsers = ctx.users.slice(4, 4 + remainingSlots);

  for (const user of randomUsers) {
    entities.push(
      repo.create({
        userId: user.id,
        businessName: faker.company.name(),
        description: faker.lorem.paragraph(),
        averageRating: parseFloat(faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }).toFixed(1)),
        isAvailable: faker.datatype.boolean({ probability: 0.8 }),
        avatarUrl: `https://picsum.photos/seed/${user.id}/200`,
      }),
    );
  }

  ctx.providers = await repo.save(entities);
}
