import { DataSource } from 'typeorm';

import { User } from '@app/modules/shared/providers/database/entities/user.entity';
import { UserEmail } from '@app/modules/shared/providers/database/entities/user-email.entity';
import { UserPhone } from '@app/modules/shared/providers/database/entities/user-phone.entity';
import { UserAddress } from '@app/modules/shared/providers/database/entities/user-address.entity';
import { ProviderProfile } from '@app/modules/shared/providers/database/entities/provider-profile.entity';
import { Document } from '@app/modules/shared/providers/database/entities/document.entity';
import { ProviderVerification } from '@app/modules/shared/providers/database/entities/provider-verification.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

/**
 * QA Test Providers Seeder
 *
 * Creates fixed provider users for automated testing.
 * These users are created with known credentials to enable
 * stable, repeatable tests in Maestro E2E flows.
 *
 * Test Users:
 * - provider-test-1@test.com
 * - provider-test-2@test.com
 * - provider-test-3@test.com
 *
 * All use password: Test@12345
 * CPF: 12345678901 (valid format for testing)
 * Phone: 11987654321
 */

const TEST_PROVIDERS = [
  {
    keycloakId: 'provider-test-1-uuid',
    fullName: 'Provider Test One',
    email: 'provider-test-1@test.com',
    phone: '11987654321',
    cpf: '12345678901',
    businessName: 'Test Service Provider 1',
    cep: '01310100',
    number: '100',
  },
  {
    keycloakId: 'provider-test-2-uuid',
    fullName: 'Provider Test Two',
    email: 'provider-test-2@test.com',
    phone: '11987654322',
    cpf: '12345678902',
    businessName: 'Test Service Provider 2',
    cep: '01310100',
    number: '200',
  },
  {
    keycloakId: 'provider-test-3-uuid',
    fullName: 'Provider Test Three',
    email: 'provider-test-3@test.com',
    phone: '11987654323',
    cpf: '12345678903',
    businessName: 'Test Service Provider 3',
    cep: '01310100',
    number: '300',
  },
];

export async function seedQATestProviders(ds: DataSource, ctx: SeedContext, cfg: SeedConfig): Promise<void> {
  // Only seed in QA/test environment
  if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
    return;
  }

  const userRepo = ds.getRepository(User);
  const emailRepo = ds.getRepository(UserEmail);
  const phoneRepo = ds.getRepository(UserPhone);
  const addressRepo = ds.getRepository(UserAddress);
  const profileRepo = ds.getRepository(ProviderProfile);
  const docRepo = ds.getRepository(Document);
  const verificationRepo = ds.getRepository(ProviderVerification);

  for (const testProvider of TEST_PROVIDERS) {
    // Check if user already exists
    const existing = await userRepo.findOne({
      where: { keycloakId: testProvider.keycloakId },
    });

    if (existing) {
      console.log(`[QA Seeder] Skipping ${testProvider.email} - already exists`);
      continue;
    }

    console.log(`[QA Seeder] Creating ${testProvider.email}`);

    // Create user
    const user = await userRepo.save({
      keycloakId: testProvider.keycloakId,
      fullName: testProvider.fullName,
      status: 'ACTIVE',
    });

    // Create email
    await emailRepo.save({
      userId: user.id,
      email: testProvider.email,
      isVerified: true,
      verifiedAt: new Date(),
    });

    // Create phone
    await phoneRepo.save({
      userId: user.id,
      phoneNumber: testProvider.phone,
      isVerified: true,
      verifiedAt: new Date(),
    });

    // Create address (required for provider flow)
    const address = await addressRepo.save({
      userId: user.id,
      cep: testProvider.cep,
      street: 'Avenida Paulista',
      number: testProvider.number,
      city: 'São Paulo',
      state: 'SP',
      country: 'Brazil',
      latitude: -23.5505,
      longitude: -46.6333,
    });

    // Create provider profile
    const profile = await profileRepo.save({
      userId: user.id,
      businessName: testProvider.businessName,
      description: 'QA Test Provider for Maestro E2E Tests',
      averageRating: 4.5,
      isAvailable: true,
    });

    // Create document (CPF - required for provider verification)
    await docRepo.save({
      userId: user.id,
      documentType: 'CPF',
      documentNumber: testProvider.cpf,
      isVerified: true,
      verifiedAt: new Date(),
      metadata: {
        source: 'qa-seeder',
        purpose: 'automated-testing',
      },
    });

    // Create provider verification (mark as verified to skip verification flow)
    await verificationRepo.save({
      userId: user.id,
      verificationStatus: 'VERIFIED',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      phoneVerified: true,
      phoneVerifiedAt: new Date(),
      documentVerified: true,
      documentVerifiedAt: new Date(),
    });

    console.log(`[QA Seeder] ✅ Created ${testProvider.email}`);
  }
}
