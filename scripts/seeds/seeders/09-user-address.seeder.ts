import { DataSource } from 'typeorm';

import { UserAddress } from '@app/modules/shared/providers/database/entities/user-address.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

export async function seedUserAddresses(ds: DataSource, ctx: SeedContext, _cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(UserAddress);

  const entities: UserAddress[] = [];

  for (let i = 0; i < ctx.users.length; i++) {
    const user = ctx.users[i];
    const homeAddress = ctx.addresses[i * 2];
    const workAddress = ctx.addresses[i * 2 + 1];

    entities.push(
      repo.create({ userId: user.id, addressId: homeAddress.id, label: 'casa', isPrimary: true }),
    );

    if (workAddress) {
      entities.push(
        repo.create({ userId: user.id, addressId: workAddress.id, label: 'trabalho', isPrimary: false }),
      );
    }
  }

  ctx.userAddresses = await repo.save(entities);
}
