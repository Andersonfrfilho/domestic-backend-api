import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { Document } from '@app/modules/shared/providers/database/entities/document.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

const DOCUMENT_TYPES = ['CPF', 'RG', 'CNH', 'COMPROVANTE_RESIDENCIA'];
const DOCUMENT_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

export async function seedDocuments(ds: DataSource, ctx: SeedContext, _cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(Document);

  const entities: Document[] = [];

  for (const user of ctx.users) {
    const docType = faker.helpers.arrayElement(DOCUMENT_TYPES);
    const status = faker.helpers.arrayElement(DOCUMENT_STATUSES);
    const isApproved = status === 'APPROVED';

    entities.push(
      repo.create({
        userId: user.id,
        documentType: docType,
        documentUrl: `documents/${user.id}/${docType.toLowerCase()}.pdf`,
        status,
        verifiedAt: isApproved ? faker.date.recent({ days: 30 }) : undefined,
      }),
    );
  }

  ctx.documents = await repo.save(entities);
}
