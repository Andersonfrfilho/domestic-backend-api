/**
 * Provider Module Flow — Spec-Driven
 *
 * Fluxos cobertos:
 *   1. Criar perfil de prestador
 *   2. Listar prestadores
 *   3. Buscar prestador por ID
 *   4. Atualizar perfil
 *   5. Adicionar serviço ao prestador
 *   6. Listar serviços do prestador
 *   7. Remover serviço
 *   8. Adicionar local de atendimento
 *   9. Listar locais
 *  10. Remover local
 *  11. Submeter verificação
 *  12. Status de verificação
 */

import crypto from 'node:crypto';
import { getServiceToken, getUserToken, decodeJwtPayload } from './lib/auth.ts';
import { request, type Flow, type Assertion, type RequestResponse } from './lib/runner.ts';

interface ProviderFlowCtx {
  serviceToken: string;
  userToken: string;
  userId: string;
  providerId: string;
  serviceId: string;
  locationId: string;
  categoryId: string;
  catServiceId: string;
  addressId: string;
  userAddressId: string;
}

type JsonBody = Record<string, unknown> | null;

function authHeaders(ctx: ProviderFlowCtx): Record<string, string> {
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

const providerFlow: Flow<ProviderFlowCtx> = {
  name: 'Provider Lifecycle Flow',

  setup: async (ctx) => {
    ctx.serviceToken = await getServiceToken();
    ctx.userToken = await getUserToken();

    // 1. Create a fresh fake user for this run
    const fakeKeycloakId = crypto.randomUUID();
    const userRes = await request('POST', '/users', {
      body: { fullName: 'Fake Provider User', keycloakId: fakeKeycloakId, status: 'ACTIVE' },
    });
    if (userRes.status === 201 || userRes.status === 200) {
      ctx.userId = (userRes.json as JsonBody)?.['id'] as string;
    } else {
      throw new Error(`Failed to create fake user for provider flow: ${userRes.status}`);
    }

    // 2. Create a category and a service in catalog for testing
    const catRes = await request('POST', '/categories', {
      body: { name: 'Prov Test Cat', slug: 'prov-test-cat-' + Date.now() },
    });
    ctx.categoryId = (catRes.json as JsonBody)?.['id'] as string;

    const svcRes = await request('POST', '/services', {
      body: { name: 'Prov Test Svc', categoryId: ctx.categoryId, basePrice: 50 },
    });
    ctx.catServiceId = (svcRes.json as JsonBody)?.['id'] as string;

    // 3. Create an address to use in work-location
    const addrRes = await request('POST', '/users/me/addresses', {
      headers: authHeaders(ctx),
      body: {
        street: 'Rua dos Prestadores',
        number: '42',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
      },
    });
    const addrBody = addrRes.json as JsonBody;
    ctx.userAddressId = addrBody?.['id'] as string;
    ctx.addressId = addrBody?.['addressId'] as string;
  },

  steps: [
    // ── 01 criar perfil ───────────────────────────────────────────────────────
    {
      name: 'POST /providers — criar perfil',
      request: (ctx) => ({
        method: 'POST',
        path: '/providers',
        body: { userId: ctx.userId, description: 'Sou um prestador de teste' },
      }),
      expect: (res) => [statusIs(res, 201, 200, 409)], // 409 se já existir
      capture: (res, ctx) => {
        const body = res.json as JsonBody;
        if (body?.['id']) ctx.providerId = body['id'] as string;
      },
    },

    // ── fallback: se 409, tentar buscar o perfil existente via admin/pending ──
    {
      name: 'GET /providers/admin/pending — buscar id do prestador (fallback)',
      request: () => ({ method: 'GET', path: '/providers/admin/pending' }),
      expect: (res) => [statusIs(res, 200)],
      capture: (res, ctx) => {
        if (!ctx.providerId) {
          const list = res.json as JsonBody[];
          console.log(`    DEBUG: list.length=${list.length}, ctx.userId=${ctx.userId}`);
          const found = list.find(p => p?.['userId'] === ctx.userId);
          if (found) {
            ctx.providerId = found['id'] as string;
            console.log(`    DEBUG: found providerId=${ctx.providerId}`);
          } else {
            console.log(`    DEBUG: provider not found in list`);
            if (list.length > 0) console.log(`    DEBUG: first item keys: ${Object.keys(list[0] ?? {})}`);
          }
        }
      },
      skip: (ctx) => !!ctx.providerId,
    },

    // ── 02 buscar por id ──────────────────────────────────────────────────────
    {
      name: (ctx) => `GET /providers/${ctx.providerId} — buscar por ID`,
      request: (ctx) => ({ method: 'GET', path: `/providers/${ctx.providerId}` }),
      expect: (res, ctx) => [
        statusIs(res, 200),
        eq('id correto', (res.json as JsonBody)?.['id'], ctx.providerId),
      ],
    },

    // ── 03 atualizar perfil ───────────────────────────────────────────────────
    {
      name: (ctx) => `PUT /providers/${ctx.providerId} — atualizar`,
      request: (ctx) => ({
        method: 'PUT',
        path: `/providers/${ctx.providerId}`,
        body: { description: 'Descrição atualizada' },
      }),
      expect: (res) => [
        statusIs(res, 200),
        eq('descrição atualizada', (res.json as JsonBody)?.['description'], 'Descrição atualizada'),
      ],
    },

    // ── 04 adicionar serviço ──────────────────────────────────────────────────
    {
      name: (ctx) => `POST /providers/${ctx.providerId}/services — adicionar serviço`,
      request: (ctx) => ({
        method: 'POST',
        path: `/providers/${ctx.providerId}/services`,
        body: { serviceId: ctx.catServiceId, customPrice: 60 },
      }),
      expect: (res) => [statusIs(res, 201, 200, 409)],
      capture: (res, ctx) => {
        const body = res.json as JsonBody;
        if (body?.['id']) ctx.serviceId = body['id'] as string;
      },
    },

    // ── 05 listar serviços ────────────────────────────────────────────────────
    {
      name: (ctx) => `GET /providers/${ctx.providerId}/services — listar serviços`,
      request: (ctx) => ({ method: 'GET', path: `/providers/${ctx.providerId}/services` }),
      expect: (res) => [
        statusIs(res, 200),
        { label: 'pelo menos 1 serviço', ok: (res.json as any[]).length > 0 },
      ],
    },

    // ── 06 adicionar local de atendimento ─────────────────────────────────────
    {
      name: (ctx) => `POST /providers/${ctx.providerId}/work-locations — adicionar local`,
      request: (ctx) => ({
        method: 'POST',
        path: `/providers/${ctx.providerId}/work-locations`,
        body: { addressId: ctx.addressId, name: 'Local de Teste', isPrimary: true },
      }),
      expect: (res) => [
        statusIs(res, 201, 200),
        ok('id presente', (res.json as JsonBody)?.['id']),
      ],
      capture: (res, ctx) => {
        const body = res.json as JsonBody;
        if (body?.['id']) ctx.locationId = body['id'] as string;
      },
    },

    // ── 07 listar locais ──────────────────────────────────────────────────────
    {
      name: (ctx) => `GET /providers/${ctx.providerId}/work-locations — listar locais`,
      request: (ctx) => ({ method: 'GET', path: `/providers/${ctx.providerId}/work-locations` }),
      expect: (res) => [
        statusIs(res, 200),
        { label: 'pelo menos 1 local', ok: (res.json as any[]).length > 0 },
      ],
    },

    // ── 08 submeter verificação ───────────────────────────────────────────────
    {
      name: (ctx) => `POST /providers/${ctx.providerId}/verification — submeter`,
      request: (ctx) => ({
        method: 'POST',
        path: `/providers/${ctx.providerId}/verification`,
        headers: { 'X-User-Id': ctx.userId }, // Simulating Kong header
      }),
      expect: (res) => [statusIs(res, 200, 201)],
    },

    // ── 09 status verificação ─────────────────────────────────────────────────
    {
      name: (ctx) => `GET /providers/${ctx.providerId}/verification — status`,
      request: (ctx) => ({ method: 'GET', path: `/providers/${ctx.providerId}/verification` }),
      expect: (res) => [
        statusIs(res, 200),
        ok('status presente', (res.json as JsonBody)?.['status']),
      ],
    },

    // ── 10 remover serviço ────────────────────────────────────────────────────
    {
      name: (ctx) => `DELETE /providers/${ctx.providerId}/services/${ctx.catServiceId} — remover serviço`,
      request: (ctx) => ({
        method: 'DELETE',
        path: `/providers/${ctx.providerId}/services/${ctx.catServiceId}`,
      }),
      expect: (res) => [statusIs(res, 204)],
    },

    // ── 11 remover local ──────────────────────────────────────────────────────
    {
      name: (ctx) => `DELETE /providers/${ctx.providerId}/work-locations/${ctx.locationId} — remover local`,
      request: (ctx) => ({
        method: 'DELETE',
        path: `/providers/${ctx.providerId}/work-locations/${ctx.locationId}`,
      }),
      expect: (res) => [statusIs(res, 204)],
    },
  ],

  teardown: async (ctx) => {
    if (ctx.userAddressId) {
      await request('DELETE', `/users/me/addresses/${ctx.userAddressId}`, {
        headers: authHeaders(ctx),
      });
    }
    if (ctx.categoryId) {
      await request('DELETE', `/categories/${ctx.categoryId}`);
    }
  },
};

export default [providerFlow];

if (process.argv[1]?.endsWith('provider.flow.ts')) {
  const { runAll } = await import('./lib/runner.ts');
  await runAll([providerFlow]);
}
