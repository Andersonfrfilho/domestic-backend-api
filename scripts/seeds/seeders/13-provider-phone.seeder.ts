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

  const entities: ProviderPhone[] = [];

  for (const provider of ctx.providers) {
    const businessPhone = await phoneRepo.save(
      phoneRepo.create({
        number: randomBrPhone(),
        type: 'WHATSAPP',
        isVerified: true,
      }),
    );

    entities.push(
      providerPhoneRepo.create({
        providerId: provider.id,
        phoneId: businessPhone.id,
        label: 'whatsapp comercial',
        isPrimary: true,
      }),
    );
  }

  ctx.providerPhones = await providerPhoneRepo.save(entities);
}
