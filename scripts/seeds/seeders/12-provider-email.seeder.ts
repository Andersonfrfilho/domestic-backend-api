import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { Email } from '@app/modules/shared/providers/database/entities/email.entity';
import { ProviderEmail } from '@app/modules/shared/providers/database/entities/provider-email.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

export async function seedProviderEmails(ds: DataSource, ctx: SeedContext, _cfg: SeedConfig): Promise<void> {
  const emailRepo = ds.getRepository(Email);
  const providerEmailRepo = ds.getRepository(ProviderEmail);

  const entities: ProviderEmail[] = [];

  for (const provider of ctx.providers) {
    const businessEmail = await emailRepo.save(
      emailRepo.create({ email: faker.internet.email().toLowerCase() }),
    );

    entities.push(
      providerEmailRepo.create({
        providerId: provider.id,
        emailId: businessEmail.id,
        label: 'empresarial',
        isPrimary: true,
      }),
    );
  }

  ctx.providerEmails = await providerEmailRepo.save(entities);
}
