/**
 * Email Module Flow — Spec-Driven
 *
 * Fluxos cobertos:
 *   1. Autenticação (service token + user token via Keycloak)
 *   2. Adicionar email → captura userEmailId
 *   3. Listar emails
 *   4. Enviar código de verificação (retorna 204)
 *   5. Verificar código ('0000' em dev)
 *   6. Remover email
 */

import { getServiceToken, getUserToken, decodeJwtPayload } from './lib/auth.ts';
import { request, type Flow, type Assertion, type RequestResponse } from './lib/runner.ts';

interface EmailFlowCtx {
  serviceToken: string;
  userToken: string;
  keycloakId: string;
  userId: string;
  userEmailId: string;
}

type JsonBody = Record<string, unknown> | null;

function authHeaders(ctx: EmailFlowCtx): Record<string, string> {
  return {
    Authorization: `Bearer ${ctx.serviceToken}`,
    'X-Access-Token': ctx.userToken,
  };
}

function ok(label: string, value: unknown): Assertion {
  return { label, ok: !!value, detail: value == null ? 'got null/undefined' : String(value) };
}

function eq(label: string, actual: unknown, expected: unknown): Assertion {
  return { label, ok: actual === expected, detail: `got "${actual}", expected "${expected}"` };
}

function statusIs(res: RequestResponse, ...codes: number[]): Assertion {
  return { label: `status ${codes.join(' or ')}`, ok: codes.includes(res.status), detail: `got ${res.status}` };
}

const testEmail = 'flow-test@domestic.local';
const devCode = '0000';

const emailCrudFlow: Flow<EmailFlowCtx> = {
  name: 'Email CRUD + Verification Flow',

  setup: async (ctx) => {
    ctx.serviceToken = await getServiceToken();
    ctx.userToken = await getUserToken();
    const payload = decodeJwtPayload<{ sub: string }>(ctx.userToken);
    ctx.keycloakId = payload.sub;

    // resolve userId via /users/me
    const headers = authHeaders(ctx);
    const meRes = await request('GET', '/users/me', { headers });
    const body = meRes.json as JsonBody;
    if (body?.['id']) ctx.userId = body['id'] as string;

    // cleanup: remove emails from previous failed runs
    const listRes = await request('GET', '/users/me/emails', { headers });
    const emails = listRes.json as JsonBody[] | null;
    if (Array.isArray(emails) && emails.length > 0) {
      for (const e of emails) {
        await request('DELETE', `/users/me/emails/${e['id']}`, { headers });
      }
      console.log(`  cleanup: ${emails.length} email(s) removido(s)`);
    }
  },

  steps: [
    // ── 01 adicionar email ────────────────────────────────────────────────────
    {
      name: 'POST /users/me/emails — adicionar email',
      request: (ctx) => ({
        method: 'POST',
        path: '/users/me/emails',
        headers: authHeaders(ctx),
        body: {
          email: testEmail,
          label: 'Pessoal',
          isPrimary: true,
        },
      }),
      expect: (res) => {
        const body = res.json as JsonBody;
        return [
          statusIs(res, 201),
          ok('id presente', body?.['id']),
          eq('isPrimary true', body?.['isPrimary'], true),
        ];
      },
      capture: (res, ctx) => {
        const body = res.json as JsonBody;
        if (body?.['id']) ctx.userEmailId = body['id'] as string;
      },
      required: true,
    },

    // ── 02 listar emails ──────────────────────────────────────────────────────
    {
      name: 'GET /users/me/emails — listar emails',
      request: (ctx) => ({ method: 'GET', path: '/users/me/emails', headers: authHeaders(ctx) }),
      expect: (res) => {
        const body = res.json as unknown[];
        return [
          statusIs(res, 200),
          { label: 'retorna array', ok: Array.isArray(body), detail: `got ${typeof body}` },
          { label: 'pelo menos 1 email', ok: Array.isArray(body) && body.length > 0, detail: `got ${Array.isArray(body) ? body.length : 0}` },
        ];
      },
    },

    // ── 03 enviar código de verificação ───────────────────────────────────────
    {
      name: (ctx) => `POST /users/me/emails/${ctx.userEmailId}/send-verification`,
      request: (ctx) => ({
        method: 'POST',
        path: `/users/me/emails/${ctx.userEmailId}/send-verification`,
        headers: authHeaders(ctx),
      }),
      expect: (res) => [statusIs(res, 204)],
    },

    // ── 04 verificar código ('0000' em dev) ───────────────────────────────────
    {
      name: (ctx) => `POST /users/me/emails/${ctx.userEmailId}/verify`,
      request: (ctx) => ({
        method: 'POST',
        path: `/users/me/emails/${ctx.userEmailId}/verify`,
        headers: authHeaders(ctx),
        body: { code: devCode },
      }),
      expect: (res) => {
        const body = res.json as JsonBody;
        return [
          statusIs(res, 200, 201),
          ok('id presente', body?.['id']),
        ];
      },
    },

    // ── 05 remover email ──────────────────────────────────────────────────────
    {
      name: (ctx) => `DELETE /users/me/emails/${ctx.userEmailId}`,
      request: (ctx) => ({
        method: 'DELETE',
        path: `/users/me/emails/${ctx.userEmailId}`,
        headers: authHeaders(ctx),
      }),
      expect: (res) => [statusIs(res, 204)],
    },
  ],
};

export default [emailCrudFlow];

if (process.argv[1]?.endsWith('email.flow.ts')) {
  const { runAll } = await import('./lib/runner.ts');
  await runAll([emailCrudFlow]);
}
