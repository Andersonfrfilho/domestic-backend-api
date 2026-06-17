import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { ProviderService } from '@app/modules/shared/providers/database/entities/provider-service.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

const PRICE_TYPES = ['FIXED', 'HOUR', 'DAY'];
const DURATION_MINUTES = [30, 45, 60, 90, 120, 150, 180, 240];

export async function seedProviderServices(ds: DataSource, ctx: SeedContext, _cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(ProviderService);

  const entities: ProviderService[] = [];

  for (const provider of ctx.providers) {
    // Each provider offers 2–4 random services
    const count = faker.number.int({ min: 2, max: 4 });
    const pickedServices = faker.helpers.arrayElements(ctx.services, count);

    for (const service of pickedServices) {
      entities.push(
        repo.create({
          providerId: provider.id,
          serviceId: service.id,
          priceBase: parseFloat(faker.number.float({ min: 50, max: 500, fractionDigits: 2 }).toFixed(2)),
          priceType: faker.helpers.arrayElement(PRICE_TYPES),
          estimatedDurationMinutes: faker.helpers.arrayElement(DURATION_MINUTES),
        }),
      );
    }
  }

  ctx.providerServices = await repo.save(entities);
}
