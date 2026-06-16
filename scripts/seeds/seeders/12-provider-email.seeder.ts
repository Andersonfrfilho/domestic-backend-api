import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { Email } from '@app/modules/shared/providers/database/entities/email.entity';
import { ProviderEmail } from '@app/modules/shared/providers/database/entities/provider-email.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

export async function seedProviderEmails(ds: DataSource, ctx: SeedContext, _cfg: SeedConfig): Promise<void> {
  const emailRepo = ds.getRepository(Email);
  const providerEmailRepo = ds.getRepository(ProviderEmail);

  const emailEntities = ctx.providers.map(() =>
    emailRepo.create({ email: faker.internet.email().toLowerCase() }),
  );
  const savedEmails = await emailRepo.save(emailEntities);

  const entities = ctx.providers.map((provider, i) =>
    providerEmailRepo.create({
      providerId: provider.id,
      emailId: savedEmails[i].id,
      label: 'empresarial',
      isPrimary: true,
    }),
  );

  ctx.providerEmails = await providerEmailRepo.save(entities);
}
