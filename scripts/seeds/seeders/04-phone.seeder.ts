import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { Phone } from '@app/modules/shared/providers/database/entities/phone.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

const PHONE_TYPES = ['MOBILE', 'LANDLINE', 'WHATSAPP'];

function randomBrPhone(): string {
  const ddd = faker.number.int({ min: 11, max: 99 });
  const number = faker.number.int({ min: 900000000, max: 999999999 });
  return `+55${ddd}${number}`;
}

// 2 phones per user (one primary, one secondary)
export async function seedPhones(ds: DataSource, ctx: SeedContext, cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(Phone);

  const total = cfg.users * 2;
  const entities: Phone[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < total; i++) {
    let number: string;
    do { number = randomBrPhone(); } while (seen.has(number));
    seen.add(number);

    entities.push(
      repo.create({
        number,
        type: faker.helpers.arrayElement(PHONE_TYPES),
      }),
    );
  }

  ctx.phones = await repo.save(entities);
}
