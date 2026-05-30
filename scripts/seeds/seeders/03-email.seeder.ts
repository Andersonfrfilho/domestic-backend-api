import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { Email } from '@app/modules/shared/providers/database/entities/email.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

// 2 emails per user (one primary, one secondary).
// Fixed test users (first 3 from Keycloak) use their real emails.
export async function seedEmails(ds: DataSource, ctx: SeedContext, cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(Email);

  const entities: Email[] = [];

  // Fixed emails: one per keycloak test user (primary only — no secondary)
  for (const ku of ctx.keycloakUsers.slice(0, 3)) {
    const existing = await repo.findOne({ where: { email: ku.email } });
    if (existing) {
      entities.push(existing);
    } else {
      entities.push(await repo.save(repo.create({ email: ku.email, isVerified: true })));
    }
  }

  // Random emails for remaining users (2 per user)
  const randomCount = Math.max(0, cfg.users - 3) * 2;
  const randomEntities: Email[] = [];
  for (let i = 0; i < randomCount; i++) {
    randomEntities.push(
      repo.create({
        email: faker.internet.email().toLowerCase(),
        isVerified: faker.datatype.boolean({ probability: 0.8 }),
      }),
    );
  }

  const savedRandom = randomEntities.length > 0 ? await repo.save(randomEntities) : [];
  ctx.emails = [...entities, ...savedRandom];
}
