import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { ProviderVerification } from '@app/modules/shared/providers/database/entities/provider-verification.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

// Mirrors the fixed provider order set in 11-provider-profile.seeder.ts:
//   ctx.providers[0] = provider-test  → UNDER_REVIEW (em análise, ainda não aprovado)
//   ctx.providers[1] = provider-full  → APPROVED     (aprovado, pode receber solicitações)
//   ctx.providers[2+] = random        → status aleatório
const FIXED_STATUSES: ReadonlyArray<'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'> = [
  'UNDER_REVIEW',
  'APPROVED',
];

const RANDOM_STATUSES = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] as const;

export async function seedProviderVerifications(ds: DataSource, ctx: SeedContext, _cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(ProviderVerification);

  const entities: ProviderVerification[] = [];

  for (let i = 0; i < ctx.providers.length; i++) {
    const provider = ctx.providers[i];
    const status =
      i < FIXED_STATUSES.length
        ? FIXED_STATUSES[i]
        : faker.helpers.arrayElement(RANDOM_STATUSES);
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
