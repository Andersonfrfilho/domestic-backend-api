import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { Address } from '@app/modules/shared/providers/database/entities/address.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

const BR_STATES = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO', 'PE', 'CE'];

// 2 addresses per user (home + work) + 1 extra per provider for work location
export async function seedAddresses(ds: DataSource, ctx: SeedContext, cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(Address);

  const providerCount = Math.round(cfg.users * cfg.providersRatio);
  const total = cfg.users * 2 + providerCount;
  const entities: Address[] = [];

  for (let i = 0; i < total; i++) {
    entities.push(
      repo.create({
        street: faker.location.street(),
        number: faker.number.int({ min: 1, max: 9999 }).toString(),
        complement: faker.datatype.boolean({ probability: 0.4 }) ? `Apto ${faker.number.int({ min: 1, max: 200 })}` : undefined,
        neighborhood: faker.location.county(),
        city: faker.location.city(),
        state: faker.helpers.arrayElement(BR_STATES),
        zipCode: faker.string.numeric(8),
        latitude: faker.datatype.boolean({ probability: 0.6 }) ? faker.location.latitude({ min: -33, max: 5, precision: 6 }).toString() : undefined,
        longitude: faker.datatype.boolean({ probability: 0.6 }) ? faker.location.longitude({ min: -74, max: -34, precision: 6 }).toString() : undefined,
        isVerified: faker.datatype.boolean({ probability: 0.5 }),
      }),
    );
  }

  ctx.addresses = await repo.save(entities);
}
