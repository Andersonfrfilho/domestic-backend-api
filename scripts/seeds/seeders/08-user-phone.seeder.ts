import { DataSource } from 'typeorm';

import { UserPhone } from '@app/modules/shared/providers/database/entities/user-phone.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

export async function seedUserPhones(ds: DataSource, ctx: SeedContext, _cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(UserPhone);

  const entities: UserPhone[] = [];

  const now = new Date();
  const fixedCount = ctx.keycloakUsers.length;

  for (let i = 0; i < ctx.users.length; i++) {
    const user = ctx.users[i];
    const primaryPhone = ctx.phones[i * 2];
    const secondaryPhone = ctx.phones[i * 2 + 1];
    const isFixed = i < fixedCount;

    if (primaryPhone) {
      entities.push(
        repo.create({ userId: user.id, phoneId: primaryPhone.id, label: 'celular', isPrimary: true, verifiedAt: isFixed ? now : null }),
      );
    }

    if (secondaryPhone) {
      entities.push(
        repo.create({ userId: user.id, phoneId: secondaryPhone.id, label: 'fixo', isPrimary: false, verifiedAt: null }),
      );
    }
  }

  ctx.userPhones = await repo.save(entities);
}
