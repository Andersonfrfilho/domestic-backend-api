import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { Phone } from '@app/modules/shared/providers/database/entities/phone.entity';
import { ProviderPhone } from '@app/modules/shared/providers/database/entities/provider-phone.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

function randomBrPhone(): string {
  const ddd = faker.number.int({ min: 11, max: 99 });
  const number = faker.number.int({ min: 900000000, max: 999999999 });
  return `+55${ddd}${number}`;
}

export async function seedProviderPhones(ds: DataSource, ctx: SeedContext, _cfg: SeedConfig): Promise<void> {
  const phoneRepo = ds.getRepository(Phone);
  const providerPhoneRepo = ds.getRepository(ProviderPhone);

  const seen = new Set(ctx.phones.map((p) => p.number));

  const phoneEntities: Phone[] = ctx.providers.map(() => {
    let number: string;
    do { number = randomBrPhone(); } while (seen.has(number));
    seen.add(number);
    return phoneRepo.create({ number, type: 'WHATSAPP' });
  });

  const savedPhones = await phoneRepo.save(phoneEntities);

  const entities = ctx.providers.map((provider, i) =>
    providerPhoneRepo.create({
      providerId: provider.id,
      phoneId: savedPhones[i].id,
      label: 'whatsapp comercial',
      isPrimary: true,
    }),
  );

  ctx.providerPhones = await providerPhoneRepo.save(entities);
}
