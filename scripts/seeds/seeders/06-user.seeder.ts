import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { User } from '@app/modules/shared/providers/database/entities/user.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

const USER_STATUSES = ['PENDING', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'SUSPENDED'];

export async function seedUsers(ds: DataSource, ctx: SeedContext, cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(User);

  const entities: User[] = [];

  for (let i = 0; i < cfg.users; i++) {
    entities.push(
      repo.create({
        keycloakId: faker.string.uuid(),
        fullName: faker.person.fullName(),
        status: faker.helpers.arrayElement(USER_STATUSES),
      }),
    );
  }

  ctx.users = await repo.save(entities);
}
