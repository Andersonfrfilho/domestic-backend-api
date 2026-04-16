import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { ProviderVerificationLog } from '@app/modules/shared/providers/database/entities/provider-verification-log.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

const ACTIONS = ['SUBMITTED', 'MOVED_TO_REVIEW', 'APPROVED', 'REJECTED'];

export async function seedProviderVerificationLogs(ds: DataSource, ctx: SeedContext, _cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(ProviderVerificationLog);

  const entities: ProviderVerificationLog[] = [];

  for (const verification of ctx.providerVerifications) {
    // Every verification starts with SUBMITTED
    entities.push(
      repo.create({
        verificationId: verification.id,
        action: 'SUBMITTED',
        performedBy: undefined,
        previousStatus: undefined,
        newStatus: 'PENDING',
        notes: 'Solicitação enviada pelo prestador',
      }),
    );

    // If reviewed, add a state transition log
    if (verification.status !== 'PENDING') {
      entities.push(
        repo.create({
          verificationId: verification.id,
          action: verification.status === 'UNDER_REVIEW' ? 'MOVED_TO_REVIEW' : verification.status,
          performedBy: faker.string.uuid(),
          previousStatus: 'PENDING',
          newStatus: verification.status,
          notes: verification.notes ?? faker.lorem.sentence(),
        }),
      );
    }
  }

  ctx.providerVerificationLogs = await repo.save(entities);
}
