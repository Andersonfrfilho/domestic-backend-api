/**
 * Phone Module Flow — Spec-Driven
 *
 * Fluxos cobertos:
 *   1. Autenticação (service token + user token via Keycloak)
 *   2. Adicionar telefone → captura userPhoneId
 *   3. Listar telefones
 *   4. Enviar código de verificação (retorna 204)
 *   5. Verificar código (últimos 4 dígitos do número em dev)
 *   6. Remover telefone
 */

import { getServiceToken, getUserToken, decodeJwtPayload } from './lib/auth.ts';
import { request, type Flow, type Assertion, type RequestResponse } from './lib/runner.ts';

interface PhoneFlowCtx {
  serviceToken: string;
  userToken: string;
  keycloakId: string;
  userId: string;
  userPhoneId: string;
  phoneNumber: string;
}

type JsonBody = Record<string, unknown> | null;

function authHeaders(ctx: PhoneFlowCtx): Record<string, string> {
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

const phoneNumber = '+5585999990001';
const devCode = phoneNumber.replace(/\D/g, '').slice(-6).padStart(6, '0');

const phoneCrudFlow: Flow<PhoneFlowCtx> = {
  name: 'Phone CRUD + Verification Flow',

  setup: async (ctx) => {
    ctx.serviceToken = await getServiceToken();
    ctx.userToken = await getUserToken();
    const payload = decodeJwtPayload<{ sub: string }>(ctx.userToken);
    ctx.keycloakId = payload.sub;
    ctx.phoneNumber = phoneNumber;

    // resolve userId via /users/me
    const headers = authHeaders(ctx);
    const meRes = await request('GET', '/users/me', { headers });
    const body = meRes.json as JsonBody;
    if (body?.['id']) ctx.userId = body['id'] as string;

    // cleanup: remove phones from previous failed runs
    const listRes = await request('GET', '/users/me/phones', { headers });
    const phones = listRes.json as JsonBody[] | null;
    if (Array.isArray(phones) && phones.length > 0) {
      for (const p of phones) {
        await request('DELETE', `/users/me/phones/${p['id']}`, { headers });
      }
      console.log(`  cleanup: ${phones.length} telefone(s) removido(s)`);
    }
  },

  steps: [
    // ── 01 adicionar telefone ─────────────────────────────────────────────────
    {
      name: 'POST /users/me/phones — adicionar telefone',
      request: (ctx) => ({
        method: 'POST',
        path: '/users/me/phones',
        headers: authHeaders(ctx),
        body: {
          number: ctx.phoneNumber,
          type: 'MOBILE',
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
        if (body?.['id']) ctx.userPhoneId = body['id'] as string;
      },
      required: true,
    },

    // ── 02 listar telefones ───────────────────────────────────────────────────
    {
      name: 'GET /users/me/phones — listar telefones',
      request: (ctx) => ({ method: 'GET', path: '/users/me/phones', headers: authHeaders(ctx) }),
      expect: (res) => {
        const body = res.json as unknown[];
        return [
          statusIs(res, 200),
          { label: 'retorna array', ok: Array.isArray(body), detail: `got ${typeof body}` },
          { label: 'pelo menos 1 telefone', ok: Array.isArray(body) && body.length > 0, detail: `got ${Array.isArray(body) ? body.length : 0}` },
        ];
      },
    },

    // ── 03 enviar código de verificação ───────────────────────────────────────
    {
      name: (ctx) => `POST /users/me/phones/${ctx.userPhoneId}/send-verification`,
      request: (ctx) => ({
        method: 'POST',
        path: `/users/me/phones/${ctx.userPhoneId}/send-verification`,
        headers: authHeaders(ctx),
      }),
      expect: (res) => [statusIs(res, 204)],
    },

    // ── 04 verificar código (últimos 4 dígitos em dev) ────────────────────────
    {
      name: (ctx) => `POST /users/me/phones/${ctx.userPhoneId}/verify`,
      request: (ctx) => ({
        method: 'POST',
        path: `/users/me/phones/${ctx.userPhoneId}/verify`,
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

    // ── 05 remover telefone ───────────────────────────────────────────────────
    {
      name: (ctx) => `DELETE /users/me/phones/${ctx.userPhoneId}`,
      request: (ctx) => ({
        method: 'DELETE',
        path: `/users/me/phones/${ctx.userPhoneId}`,
        headers: authHeaders(ctx),
      }),
      expect: (res) => [statusIs(res, 204)],
    },
  ],
};

export default [phoneCrudFlow];

if (process.argv[1]?.endsWith('phone.flow.ts')) {
  const { runAll } = await import('./lib/runner.ts');
  await runAll([phoneCrudFlow]);
}
