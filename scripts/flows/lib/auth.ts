const KC_URL = process.env.KC_URL ?? 'http://localhost:8080';
const KC_REALM = process.env.KC_REALM ?? 'domestic-backend';
const TOKEN_URL = `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/token`;

async function fetchToken(body: Record<string, string>): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body).toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Keycloak token error (${res.status}): ${text}`);
  }
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

export async function getServiceToken(): Promise<string> {
  return fetchToken({
    grant_type: 'client_credentials',
    client_id: process.env.KC_API_CLIENT ?? 'domestic-api',
    client_secret: process.env.KC_API_SECRET ?? 'api-client-secret',
  });
}

export async function getUserToken(username?: string, password?: string): Promise<string> {
  return fetchToken({
    grant_type: 'password',
    client_id: process.env.KC_BFF_CLIENT ?? 'domestic-backend-bff',
    client_secret: process.env.KC_BFF_SECRET ?? 'backend-bff-client-secret',
    username: username ?? process.env.KC_USER ?? 'contractor-test',
    password: password ?? process.env.KC_PASSWORD ?? 'ChangeMeSecurePassword123!',
  });
}

export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T {
  const payload = token.split('.')[1];
  return JSON.parse(Buffer.from(payload, 'base64url').toString()) as T;
}
