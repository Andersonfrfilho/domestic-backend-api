import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { Email } from '@app/modules/shared/providers/database/entities/email.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

// 2 emails per user (one primary, one secondary)
export async function seedEmails(ds: DataSource, ctx: SeedContext, cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(Email);

  const total = cfg.users * 2;
  const entities: Email[] = [];

  for (let i = 0; i < total; i++) {
    entities.push(
      repo.create({
        email: faker.internet.email().toLowerCase(),
        isVerified: faker.datatype.boolean({ probability: 0.8 }),
      }),
    );
  }

  ctx.emails = await repo.save(entities);
}
