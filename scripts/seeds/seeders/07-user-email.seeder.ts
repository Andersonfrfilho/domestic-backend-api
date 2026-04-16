import { DataSource } from 'typeorm';

import { UserEmail } from '@app/modules/shared/providers/database/entities/user-email.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

export async function seedUserEmails(ds: DataSource, ctx: SeedContext, _cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(UserEmail);

  const entities: UserEmail[] = [];

  for (let i = 0; i < ctx.users.length; i++) {
    const user = ctx.users[i];
    const primaryEmail = ctx.emails[i * 2];
    const secondaryEmail = ctx.emails[i * 2 + 1];

    entities.push(
      repo.create({ userId: user.id, emailId: primaryEmail.id, label: 'principal', isPrimary: true }),
    );

    if (secondaryEmail) {
      entities.push(
        repo.create({ userId: user.id, emailId: secondaryEmail.id, label: 'alternativo', isPrimary: false }),
      );
    }
  }

  ctx.userEmails = await repo.save(entities);
}
