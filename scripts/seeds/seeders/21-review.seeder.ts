import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { ProviderProfile } from '@app/modules/shared/providers/database/entities/provider-profile.entity';
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

  // Recalculate averageRating for all providers based on actual seeded reviews
  const profileRepo = ds.getRepository(ProviderProfile);
  const ratingsByProvider = new Map<string, number[]>();

  for (const review of ctx.reviews) {
    const ratings = ratingsByProvider.get(review.providerId) ?? [];
    ratings.push(Number(review.rating));
    ratingsByProvider.set(review.providerId, ratings);
  }

  for (const provider of ctx.providers) {
    const ratings = ratingsByProvider.get(provider.id) ?? [];
    const average =
      ratings.length > 0
        ? Number.parseFloat((ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1))
        : 0;
    await profileRepo.update(provider.id, { averageRating: average });
  }
}
