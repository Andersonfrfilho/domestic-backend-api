/**
 * Keycloak Admin API client for seeder use.
 * Uses admin credentials (username/password) to get a token, then manages users.
 */

export interface KeycloakConfig {
  baseUrl: string;
  realm: string;
  adminUser: string;
  adminPassword: string;
}

export interface KeycloakTestUser {
  username: string;
  email: string;
  fullName: string;
  password: string;
  realmRoles: string[];
}

export interface KeycloakSeededUser extends KeycloakTestUser {
  keycloakId: string;
}

export function loadKeycloakConfig(): KeycloakConfig {
  return {
    baseUrl: process.env.KEYCLOAK_BASE_URL ?? 'http://localhost:8080',
    realm: process.env.KEYCLOAK_REALM ?? 'domestic-backend',
    adminUser: process.env.KEYCLOAK_ADMIN_USER ?? 'admin',
    adminPassword: process.env.KEYCLOAK_ADMIN_PASSWORD ?? 'admin',
  };
}

async function getAdminToken(cfg: KeycloakConfig): Promise<string> {
  const url = `${cfg.baseUrl}/realms/master/protocol/openid-connect/token`;
  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: 'admin-cli',
    username: cfg.adminUser,
    password: cfg.adminPassword,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Keycloak admin token failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

async function findUserByEmail(
  cfg: KeycloakConfig,
  token: string,
  email: string,
): Promise<string | null> {
  const url = `${cfg.baseUrl}/admin/realms/${cfg.realm}/users?email=${encodeURIComponent(email)}&exact=true`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) return null;
  const users = (await response.json()) as Array<{ id: string }>;
  return users.length > 0 ? users[0].id : null;
}

async function createUser(
  cfg: KeycloakConfig,
  token: string,
  user: KeycloakTestUser,
): Promise<string> {
  const [firstName, ...lastParts] = user.fullName.split(' ');
  const url = `${cfg.baseUrl}/admin/realms/${cfg.realm}/users`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: user.username,
      email: user.email,
      firstName,
      lastName: lastParts.join(' ') || '',
      enabled: true,
      emailVerified: true,
      credentials: [{ type: 'password', value: user.password, temporary: false }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Create user failed (${response.status}): ${text}`);
  }

  // Keycloak returns 201 with Location header containing the user ID
  const location = response.headers.get('Location') ?? '';
  const id = location.split('/').pop();
  if (!id) throw new Error(`Could not extract user ID from Location: ${location}`);
  return id;
}

async function getRoleRepresentation(
  cfg: KeycloakConfig,
  token: string,
  roleName: string,
): Promise<{ id: string; name: string } | null> {
  const url = `${cfg.baseUrl}/admin/realms/${cfg.realm}/roles/${encodeURIComponent(roleName)}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) return null;
  return (await response.json()) as { id: string; name: string };
}

async function assignRealmRoles(
  cfg: KeycloakConfig,
  token: string,
  userId: string,
  roleNames: string[],
): Promise<void> {
  const roles: Array<{ id: string; name: string }> = [];

  for (const roleName of roleNames) {
    const role = await getRoleRepresentation(cfg, token, roleName);
    if (role) roles.push(role);
  }

  if (roles.length === 0) return;

  const url = `${cfg.baseUrl}/admin/realms/${cfg.realm}/users/${userId}/role-mappings/realm`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(roles),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Assign roles failed (${response.status}): ${text}`);
  }
}

async function resetPassword(
  cfg: KeycloakConfig,
  token: string,
  userId: string,
  password: string,
): Promise<void> {
  const url = `${cfg.baseUrl}/admin/realms/${cfg.realm}/users/${userId}/reset-password`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: 'password', value: password, temporary: false }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Reset password failed (${response.status}): ${text}`);
  }
}

export async function upsertKeycloakUsers(
  cfg: KeycloakConfig,
  users: KeycloakTestUser[],
): Promise<KeycloakSeededUser[]> {
  const token = await getAdminToken(cfg);
  const seeded: KeycloakSeededUser[] = [];

  for (const user of users) {
    let keycloakId = await findUserByEmail(cfg, token, user.email);

    if (keycloakId) {
      // User already exists — ensure password is correct
      await resetPassword(cfg, token, keycloakId, user.password);
    } else {
      keycloakId = await createUser(cfg, token, user);
      await assignRealmRoles(cfg, token, keycloakId, user.realmRoles);
    }

    seeded.push({ ...user, keycloakId });
  }

  return seeded;
}
