import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { ProviderVerification } from '@app/modules/shared/providers/database/entities/provider-verification.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

const VERIFICATION_STATUSES = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];

export async function seedProviderVerifications(ds: DataSource, ctx: SeedContext, _cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(ProviderVerification);

  const entities: ProviderVerification[] = [];

  for (const provider of ctx.providers) {
    const status = faker.helpers.arrayElement(VERIFICATION_STATUSES);
    const isReviewed = status === 'APPROVED' || status === 'REJECTED';

    entities.push(
      repo.create({
        providerId: provider.id,
        status,
        reviewedAt: isReviewed ? faker.date.recent({ days: 60 }) : undefined,
        reviewedBy: isReviewed ? faker.string.uuid() : undefined,
        notes: isReviewed ? faker.lorem.sentence() : undefined,
      }),
    );
  }

  ctx.providerVerifications = await repo.save(entities);
}
