import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { User } from '@app/modules/shared/providers/database/entities/user.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

const USER_STATUSES = ['PENDING', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'SUSPENDED'];

// keycloakUsers[0] = contractor, [1] = provider (pending), [2] = provider-full (active)
const FIXED_STATUSES = ['ACTIVE', 'PENDING', 'ACTIVE'];

export async function seedUsers(ds: DataSource, ctx: SeedContext, cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(User);

  const savedFixed: User[] = [];

  for (let i = 0; i < Math.min(ctx.keycloakUsers.length, 3); i++) {
    const ku = ctx.keycloakUsers[i];
    const existing = await repo.findOne({ where: { keycloakId: ku.keycloakId } });
    if (existing) {
      savedFixed.push(existing);
    } else {
      savedFixed.push(
        await repo.save(
          repo.create({
            keycloakId: ku.keycloakId,
            fullName: ku.fullName,
            status: FIXED_STATUSES[i],
          }),
        ),
      );
    }
  }

  const remaining = Math.max(0, cfg.users - savedFixed.length);
  const randomEntities: User[] = [];
  for (let i = 0; i < remaining; i++) {
    randomEntities.push(
      repo.create({
        keycloakId: faker.string.uuid(),
        fullName: faker.person.fullName(),
        status: faker.helpers.arrayElement(USER_STATUSES),
      }),
    );
  }

  const savedRandom = randomEntities.length > 0 ? await repo.save(randomEntities) : [];
  ctx.users = [...savedFixed, ...savedRandom];
}
