import {
  loadKeycloakConfig,
  upsertKeycloakUsers,
  type KeycloakTestUser,
} from '../lib/keycloak';
import type { SeedContext } from '../lib/context';

/**
 * Fixed test users for local dev — senha única: Test@12345
 *
 * contractor-test  — contratante (faz solicitações de serviço)
 * provider-test    — prestador pendente de aprovação (verificação UNDER_REVIEW)
 * provider-full    — prestador aprovado, pronto para receber solicitações (verificação APPROVED)
 * admin-test       — admin (pode aprovar prestadores via PUT /v1/providers/:id/verification/approve)
 *
 * Roles relevantes para o fluxo de contratação:
 *   manage-requests  → criar / listar / aceitar / rejeitar / cancelar service requests
 *   manage-services  → aprovar / rejeitar verificação de prestador
 */
const TEST_PASSWORD = 'Test@12345';

export const KEYCLOAK_TEST_USERS: KeycloakTestUser[] = [
  {
    username: 'contractor-test',
    email: 'contractor-test@domestic.local',
    fullName: 'Contractor Test',
    password: TEST_PASSWORD,
    realmRoles: ['user-manager', 'contractor', 'manage-requests'],
  },
  {
    username: 'provider-test',
    email: 'provider-test@domestic.local',
    fullName: 'Provider Test',
    password: TEST_PASSWORD,
    realmRoles: ['user-manager', 'provider', 'manage-requests'],
  },
  {
    username: 'provider-full',
    email: 'provider-full@domestic.local',
    fullName: 'Provider Full Complete',
    password: TEST_PASSWORD,
    realmRoles: ['user-manager', 'provider', 'manage-requests'],
  },
  {
    username: 'admin-test',
    email: 'admin-test@domestic.local',
    fullName: 'Admin Test',
    password: TEST_PASSWORD,
    realmRoles: ['admin', 'user-manager', 'manage-services', 'manage-requests'],
  },
];

export async function seedKeycloak(ctx: SeedContext): Promise<void> {
  const cfg = loadKeycloakConfig();
  ctx.keycloakUsers = await upsertKeycloakUsers(cfg, KEYCLOAK_TEST_USERS);
}
