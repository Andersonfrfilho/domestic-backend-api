import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { ProviderDocument } from '@app/modules/shared/providers/database/entities/provider-document.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

const PROVIDER_DOC_TYPES = ['CPF', 'CNPJ', 'RG', 'LICENSE', 'DIPLOMA', 'CERTIFICATE'];
const DOC_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

export async function seedProviderDocuments(ds: DataSource, ctx: SeedContext, _cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(ProviderDocument);

  const entities: ProviderDocument[] = [];

  for (const provider of ctx.providers) {
    const docCount = faker.number.int({ min: 1, max: 3 });
    const docTypes = faker.helpers.arrayElements(PROVIDER_DOC_TYPES, docCount);

    for (const docType of docTypes) {
      const status = faker.helpers.arrayElement(DOC_STATUSES);
      const isReviewed = status !== 'PENDING';

      entities.push(
        repo.create({
          providerId: provider.id,
          documentType: docType,
          documentUrl: `documents/providers/${provider.id}/${docType.toLowerCase()}.pdf`,
          status,
          uploadedAt: faker.date.recent({ days: 90 }),
          reviewedAt: isReviewed ? faker.date.recent({ days: 30 }) : undefined,
          reviewedBy: isReviewed ? faker.string.uuid() : undefined,
          rejectionReason: status === 'REJECTED' ? faker.lorem.sentence() : undefined,
        }),
      );
    }
  }

  ctx.providerDocuments = await repo.save(entities);
}
