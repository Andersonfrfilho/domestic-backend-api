import { DataSource } from 'typeorm';

import { UserEmail } from '@app/modules/shared/providers/database/entities/user-email.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

// Fixed users (all Keycloak test users) have 1 email each (index 0..N-1 in ctx.emails).
// Random users start at index N with 2 emails each (indexes N,N+1 / N+2,N+3 / ...).
export async function seedUserEmails(ds: DataSource, ctx: SeedContext, _cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(UserEmail);

  const entities: UserEmail[] = [];
  const fixedCount = ctx.keycloakUsers.length;

  const now = new Date();

  // Fixed users — 1 primary email, verified
  for (let i = 0; i < fixedCount; i++) {
    const user = ctx.users[i];
    const primaryEmail = ctx.emails[i];

    const existing = await repo.findOne({ where: { userId: user.id, emailId: primaryEmail.id } });
    if (!existing) {
      entities.push(
        repo.create({ userId: user.id, emailId: primaryEmail.id, label: 'principal', isPrimary: true, verifiedAt: now }),
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
        repo.create({ userId: user.id, emailId: primaryEmail.id, label: 'principal', isPrimary: true, verifiedAt: now }),
      );
    }
    if (secondaryEmail) {
      entities.push(
        repo.create({ userId: user.id, emailId: secondaryEmail.id, label: 'alternativo', isPrimary: false, verifiedAt: null }),
      );
    }
  }

  const saved = entities.length > 0 ? await repo.save(entities) : [];
  const existing = await repo.find();
  ctx.userEmails = [...existing.filter(e => !saved.find(s => s.id === e.id)), ...saved];
}
