import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { ServiceRequest } from '@app/modules/shared/providers/database/entities/service-request.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

const REQUEST_STATUSES = ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'];
const PROVIDER_USER_IDS = new Set<string>();

export async function seedServiceRequests(ds: DataSource, ctx: SeedContext, cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(ServiceRequest);

  if (ctx.providers.length === 0 || ctx.services.length === 0) {
    ctx.serviceRequests = [];
    return;
  }

  // Build set of user IDs that are providers (to avoid providers contracting themselves)
  PROVIDER_USER_IDS.clear();
  for (const p of ctx.providers) PROVIDER_USER_IDS.add(p.userId);

  const contractorUsers = ctx.users.filter((u) => !PROVIDER_USER_IDS.has(u.id));
  if (contractorUsers.length === 0) {
    // All users are providers — allow providers to contract each other
    contractorUsers.push(...ctx.users);
  }

  const entities: ServiceRequest[] = [];

  for (let i = 0; i < cfg.serviceRequests; i++) {
    const contractor = faker.helpers.arrayElement(contractorUsers);
    const provider = faker.helpers.arrayElement(ctx.providers);
    const status = faker.helpers.arrayElement(REQUEST_STATUSES);

    // Find a service offered by this provider, or pick any
    const providerServiceEntry = ctx.providerServices.find((ps) => ps.providerId === provider.id);
    const serviceId = providerServiceEntry?.serviceId ?? ctx.services[0].id;

    // Use one of the contractor's addresses
    const contractorAddress = ctx.userAddresses.find((ua) => ua.userId === contractor.id);
    const addressId = contractorAddress?.addressId ?? ctx.addresses[0].id;

    const isCompleted = status === 'COMPLETED';

    entities.push(
      repo.create({
        contractorId: contractor.id,
        providerId: provider.id,
        serviceId,
        addressId,
        status,
        contractorConfirmed: isCompleted || faker.datatype.boolean(),
        providerConfirmed: isCompleted || faker.datatype.boolean(),
        description: faker.lorem.sentence(),
        scheduledAt: faker.date.soon({ days: 30 }),
        priceFinal: isCompleted
          ? parseFloat(faker.number.float({ min: 50, max: 600, fractionDigits: 2 }).toFixed(2))
          : undefined,
      }),
    );
  }

  ctx.serviceRequests = await repo.save(entities);
}
