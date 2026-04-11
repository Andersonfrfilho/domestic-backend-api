/**
 * User Module Flow — Spec-Driven
 *
 * Fluxos cobertos:
 *   1. Autenticação (service token + user token via Keycloak)
 *   2. Criar usuário  → captura user_id
 *   3. Buscar por ID
 *   4. Buscar perfil autenticado (GET /me)
 *   5. Atualizar usuário
 *   6. Adicionar endereço → captura address_id
 *   7. Listar endereços
 *   8. Remover endereço
 *   9. Deletar usuário (soft delete)
 *  10. Restaurar usuário
 *  11. Stats de usuários
 */

import { getServiceToken, getUserToken, decodeJwtPayload } from './lib/auth.ts';
import { request, type Flow, type Assertion, type RequestResponse } from './lib/runner.ts';

interface UserFlowCtx {
  serviceToken: string;
  userToken: string;
  keycloakId: string;
  fullName: string;
  userId: string;
  addressId: string;
}

type JsonBody = Record<string, unknown> | null;

// ─── helpers ──────────────────────────────────────────────────────────────────

function authHeaders(ctx: UserFlowCtx): Record<string, string> {
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

// ─── flow: criar e gerenciar usuário ──────────────────────────────────────────

const userCrudFlow: Flow<UserFlowCtx> = {
  name: 'User CRUD Flow',

  setup: async (ctx) => {
    ctx.serviceToken = await getServiceToken();
    ctx.userToken = await getUserToken();
    const payload = decodeJwtPayload<{ sub: string; name?: string }>(ctx.userToken);
    ctx.keycloakId = payload.sub;
    ctx.fullName = payload.name ?? 'Test User';

    // cleanup: remove endereços acumulados de runs anteriores que falharam no meio
    const headers = authHeaders(ctx);
    const listRes = await request('GET', '/users/me/addresses', { headers });
    const addresses = listRes.json as JsonBody[] | null;
    if (Array.isArray(addresses) && addresses.length > 0) {
      for (const addr of addresses) {
        await request('DELETE', `/users/me/addresses/${addr['id']}`, { headers });
      }
      console.log(`  cleanup: ${addresses.length} endereço(s) removido(s)`);
    }
  },

  steps: [
    // ── 01 criar usuário (201) ou já existe (409) ─────────────────────────────
    {
      name: 'POST /users — criar usuário',
      request: (ctx) => ({
        method: 'POST',
        path: '/users',
        body: { fullName: ctx.fullName, keycloakId: ctx.keycloakId, status: 'ACTIVE' },
      }),
      expect: (res) => [statusIs(res, 201, 409)],
      capture: (res, ctx) => {
        const body = res.json as JsonBody;
        if (res.status === 201 && body?.['id']) ctx.userId = body['id'] as string;
      },
      required: false,
    },

    // ── fallback: 409 → busca o id via GET /me ────────────────────────────────
    {
      name: 'GET /users/me — buscar id (fallback 409)',
      request: (ctx) => ({ method: 'GET', path: '/users/me', headers: authHeaders(ctx) }),
      expect: (res) => [
        statusIs(res, 200),
        ok('body.id presente', (res.json as JsonBody)?.['id']),
      ],
      capture: (res, ctx) => {
        const body = res.json as JsonBody;
        if (!ctx.userId && body?.['id']) ctx.userId = body['id'] as string;
      },
      skip: (ctx) => !!ctx.userId,
      required: true,
    },

    // ── 02 buscar por id ──────────────────────────────────────────────────────
    {
      name: (ctx) => `GET /users/${ctx.userId} — buscar por ID`,
      request: (ctx) => ({ method: 'GET', path: `/users/${ctx.userId}` }),
      expect: (res, ctx) => {
        const body = res.json as JsonBody;
        return [
          statusIs(res, 200),
          eq('id correto', body?.['id'], ctx.userId),
          ok('fullName presente', body?.['fullName']),
        ];
      },
    },

    // ── 03 get me ─────────────────────────────────────────────────────────────
    {
      name: 'GET /users/me — perfil autenticado',
      request: (ctx) => ({ method: 'GET', path: '/users/me', headers: authHeaders(ctx) }),
      expect: (res, ctx) => [
        statusIs(res, 200),
        eq('keycloakId correto', (res.json as JsonBody)?.['keycloakId'], ctx.keycloakId),
      ],
    },

    // ── 04 atualizar ──────────────────────────────────────────────────────────
    {
      name: (ctx) => `PUT /users/${ctx.userId} — atualizar`,
      request: (ctx) => ({
        method: 'PUT',
        path: `/users/${ctx.userId}`,
        body: { fullName: `${ctx.fullName} Updated` },
      }),
      expect: (res, ctx) => [
        statusIs(res, 200),
        eq('fullName atualizado', (res.json as JsonBody)?.['fullName'], `${ctx.fullName} Updated`),
      ],
    },

    // ── 05 adicionar endereço ─────────────────────────────────────────────────
    {
      name: 'POST /users/me/addresses — adicionar endereço',
      request: (ctx) => ({
        method: 'POST',
        path: '/users/me/addresses',
        headers: authHeaders(ctx),
        body: {
          street: 'Rua das Flores',
          number: '123',
          complement: 'Apto 4B',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01310-100',
          latitude: '-23.5505',
          longitude: '-46.6333',
          label: 'Casa',
          isPrimary: true,
        },
      }),
      expect: (res) => {
        const body = res.json as JsonBody;
        return [
          statusIs(res, 200, 201),
          ok('id presente', body?.['id']),
          eq('isPrimary true', body?.['isPrimary'], true),
          eq('label correto', body?.['label'], 'Casa'),
        ];
      },
      capture: (res, ctx) => {
        const body = res.json as JsonBody;
        if (body?.['id']) ctx.addressId = body['id'] as string;
      },
      required: true,
    },

    // ── 06 listar endereços ───────────────────────────────────────────────────
    {
      name: 'GET /users/me/addresses — listar endereços',
      request: (ctx) => ({ method: 'GET', path: '/users/me/addresses', headers: authHeaders(ctx) }),
      expect: (res) => {
        const body = res.json as unknown[];
        return [
          statusIs(res, 200),
          { label: 'retorna array', ok: Array.isArray(body), detail: `got ${typeof body}` },
          { label: 'pelo menos 1 endereço', ok: Array.isArray(body) && body.length > 0, detail: `got ${Array.isArray(body) ? body.length : 0}` },
        ];
      },
    },

    // ── 07 remover endereço ───────────────────────────────────────────────────
    {
      name: (ctx) => `DELETE /users/me/addresses/${ctx.addressId} — remover endereço`,
      request: (ctx) => ({
        method: 'DELETE',
        path: `/users/me/addresses/${ctx.addressId}`,
        headers: authHeaders(ctx),
      }),
      expect: (res) => [statusIs(res, 204)],
    },

    // ── 08 deletar usuário ────────────────────────────────────────────────────
    {
      name: (ctx) => `DELETE /users/${ctx.userId} — soft delete`,
      request: (ctx) => ({ method: 'DELETE', path: `/users/${ctx.userId}` }),
      expect: (res) => [statusIs(res, 204)],
    },

    // ── 09 restaurar usuário ──────────────────────────────────────────────────
    {
      name: (ctx) => `POST /users/${ctx.userId}/restore — restaurar`,
      request: (ctx) => ({ method: 'POST', path: `/users/${ctx.userId}/restore` }),
      expect: (res) => {
        const body = res.json as JsonBody;
        return [
          statusIs(res, 200, 201),
          { label: 'status não é DELETED', ok: body?.['status'] !== 'DELETED', detail: String(body?.['status']) },
        ];
      },
    },
  ],
};

// ─── flow: stats (independente, sem auth) ─────────────────────────────────────

const userStatsFlow: Flow = {
  name: 'User Stats Flow',

  steps: [
    {
      name: 'GET /users/admin/stats',
      request: () => ({ method: 'GET', path: '/users/admin/stats' }),
      expect: (res) => {
        const body = res.json as JsonBody;
        return [
          statusIs(res, 200),
          { label: 'totalUsers é número', ok: typeof body?.['totalUsers'] === 'number', detail: String(body?.['totalUsers']) },
          { label: 'customers é número', ok: typeof body?.['customers'] === 'number' },
          { label: 'providers é número', ok: typeof body?.['providers'] === 'number' },
        ];
      },
    },
  ],
};

export default [userCrudFlow, userStatsFlow];

// permite rodar direto: node scripts/flows/user.flow.ts [crud|stats]
if (process.argv[1]?.endsWith('user.flow.ts')) {
  const { runAll } = await import('./lib/runner.ts');
  const target = process.argv[2];
  const all = [userCrudFlow, userStatsFlow];
  const map: Record<string, Flow[]> = { crud: [userCrudFlow], stats: [userStatsFlow] };
  await runAll(target ? (map[target] ?? all) : all);
}
