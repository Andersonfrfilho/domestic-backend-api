import { DataSource } from 'typeorm';

import { UserEmail } from '@app/modules/shared/providers/database/entities/user-email.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

// Fixed users (first 3) have 1 email each (index 0,1,2 in ctx.emails).
// Random users start at index 3 with 2 emails each (indexes 3,4 / 5,6 / ...).
export async function seedUserEmails(ds: DataSource, ctx: SeedContext, _cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(UserEmail);

  const entities: UserEmail[] = [];
  const fixedCount = Math.min(ctx.keycloakUsers.length, 3);

  // Fixed users — 1 primary email, already real
  for (let i = 0; i < fixedCount; i++) {
    const user = ctx.users[i];
    const primaryEmail = ctx.emails[i];

    const existing = await repo.findOne({ where: { userId: user.id, emailId: primaryEmail.id } });
    if (!existing) {
      entities.push(
        repo.create({ userId: user.id, emailId: primaryEmail.id, label: 'principal', isPrimary: true }),
      );
    }
  }

  // Random users — 2 emails each, starting at email index fixedCount
  for (let i = fixedCount; i < ctx.users.length; i++) {
    const user = ctx.users[i];
    const emailOffset = fixedCount + (i - fixedCount) * 2;
    const primaryEmail = ctx.emails[emailOffset];
    const secondaryEmail = ctx.emails[emailOffset + 1];

    if (primaryEmail) {
      entities.push(
        repo.create({ userId: user.id, emailId: primaryEmail.id, label: 'principal', isPrimary: true }),
      );
    }
    if (secondaryEmail) {
      entities.push(
        repo.create({ userId: user.id, emailId: secondaryEmail.id, label: 'alternativo', isPrimary: false }),
      );
    }
  }

  const saved = entities.length > 0 ? await repo.save(entities) : [];
  const existing = await repo.find();
  ctx.userEmails = [...existing.filter(e => !saved.find(s => s.id === e.id)), ...saved];
}
