import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { Review } from '@app/modules/shared/providers/database/entities/review.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

const REVIEW_COMMENTS = [
  'Serviço excelente, muito pontual!',
  'Ótimo profissional, recomendo.',
  'Trabalho bem feito, ficou perfeito.',
  'Prestador atencioso e competente.',
  'Preço justo e serviço de qualidade.',
  'Superou minhas expectativas.',
  'Profissional qualificado, voltarei a contratar.',
  undefined,
];

export async function seedReviews(ds: DataSource, ctx: SeedContext, _cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(Review);

  const completedRequests = ctx.serviceRequests.filter((sr) => sr.status === 'COMPLETED');

  const entities: Review[] = [];

  for (const request of completedRequests) {
    // ~75% chance of leaving a review for a completed request
    if (!faker.datatype.boolean({ probability: 0.75 })) continue;

    entities.push(
      repo.create({
        serviceRequestId: request.id,
        contractorId: request.contractorId,
        providerId: request.providerId,
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.helpers.arrayElement(REVIEW_COMMENTS),
      }),
    );
  }

  ctx.reviews = await repo.save(entities);
}
