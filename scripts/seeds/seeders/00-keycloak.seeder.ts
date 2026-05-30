import {
  loadKeycloakConfig,
  upsertKeycloakUsers,
  type KeycloakTestUser,
} from '../lib/keycloak';
import type { SeedContext } from '../lib/context';

/**
 * Fixed test users created in Keycloak for local dev.
 * All users share the same password: Test@12345
 *
 * contractor-test@domestic.local  — contractor (consumer)
 * provider-test@domestic.local    — provider (pendente, sem doc verificado)
 * provider-full@domestic.local    — provider (completo, doc verificado)
 * admin@domestic.local            — admin
 */
const TEST_PASSWORD = 'Test@12345';

export const KEYCLOAK_TEST_USERS: KeycloakTestUser[] = [
  {
    username: 'contractor-test',
    email: 'contractor-test@domestic.local',
    fullName: 'Contractor Test',
    password: TEST_PASSWORD,
    realmRoles: ['user-manager', 'contractor'],
  },
  {
    username: 'provider-test',
    email: 'provider-test@domestic.local',
    fullName: 'Provider Test',
    password: TEST_PASSWORD,
    realmRoles: ['user-manager', 'provider'],
  },
  {
    username: 'provider-full',
    email: 'provider-full@domestic.local',
    fullName: 'Provider Full Complete',
    password: TEST_PASSWORD,
    realmRoles: ['user-manager', 'provider'],
  },
  {
    username: 'admin-test',
    email: 'admin-test@domestic.local',
    fullName: 'Admin Test',
    password: TEST_PASSWORD,
    realmRoles: ['admin', 'user-manager'],
  },
];

export async function seedKeycloak(ctx: SeedContext): Promise<void> {
  const cfg = loadKeycloakConfig();
  ctx.keycloakUsers = await upsertKeycloakUsers(cfg, KEYCLOAK_TEST_USERS);
}
