/**
 * Service Module Flow — Spec-Driven
 *
 * Fluxos cobertos:
 *   1. Criar serviço → captura service_id
 *   2. Listar serviços
 *   3. Buscar por ID
 *   4. Atualizar serviço
 */

import { request, type Flow, type Assertion, type RequestResponse } from './lib/runner.ts';

interface ServiceFlowCtx {
  categoryId: string;
  serviceId: string;
}

type JsonBody = Record<string, unknown> | null;

function ok(label: string, value: unknown): Assertion {
  return { label, ok: !!value, detail: value == null ? 'got null/undefined' : String(value) };
}

function eq(label: string, actual: unknown, expected: unknown): Assertion {
  return { label, ok: actual === expected, detail: `got "${actual}", expected "${expected}"` };
}

function statusIs(res: RequestResponse, ...codes: number[]): Assertion {
  return { label: `status ${codes.join(' or ')}`, ok: codes.includes(res.status), detail: `got ${res.status}` };
}

const testCategory = {
  name: 'Service Test Cat',
  slug: 'service-test-cat-' + Date.now(),
};

const testService = {
  name: 'Test Service',
  description: 'Test Service Description',
  basePrice: 100,
};

const serviceFlow: Flow<ServiceFlowCtx> = {
  name: 'Service CRUD Flow',

  setup: async (ctx) => {
    // Create a category to be used by services
    const catRes = await request('POST', '/categories', { body: testCategory });
    if (catRes.status === 201 || catRes.status === 200) {
      ctx.categoryId = (catRes.json as JsonBody)?.['id'] as string;
    } else {
      throw new Error(`Failed to create category for service flow: ${catRes.status}`);
    }
  },

  steps: [
    // ── 01 criar serviço ──────────────────────────────────────────────────────
    {
      name: 'POST /services — criar serviço',
      request: (ctx) => ({
        method: 'POST',
        path: '/services',
        body: { ...testService, categoryId: ctx.categoryId },
      }),
      expect: (res) => {
        const body = res.json as JsonBody;
        return [
          statusIs(res, 201, 200),
          ok('id presente', body?.['id']),
          eq('name correto', body?.['name'], testService.name),
        ];
      },
      capture: (res, ctx) => {
        const body = res.json as JsonBody;
        if (body?.['id']) ctx.serviceId = body['id'] as string;
      },
      required: true,
    },

    // ── 02 listar serviços ────────────────────────────────────────────────────
    {
      name: 'GET /services — listar serviços',
      request: () => ({ method: 'GET', path: '/services' }),
      expect: (res) => {
        const body = res.json as unknown[];
        return [
          statusIs(res, 200),
          { label: 'retorna array', ok: Array.isArray(body) },
          { label: 'pelo menos 1 serviço', ok: Array.isArray(body) && body.length > 0 },
        ];
      },
    },

    // ── 03 buscar por id ──────────────────────────────────────────────────────
    {
      name: (ctx) => `GET /services/${ctx.serviceId} — buscar por ID`,
      request: (ctx) => ({ method: 'GET', path: `/services/${ctx.serviceId}` }),
      expect: (res, ctx) => {
        const body = res.json as JsonBody;
        return [
          statusIs(res, 200),
          eq('id correto', body?.['id'], ctx.serviceId),
        ];
      },
    },

    // ── 04 atualizar ──────────────────────────────────────────────────────────
    {
      name: (ctx) => `PUT /services/${ctx.serviceId} — atualizar`,
      request: (ctx) => ({
        method: 'PUT',
        path: `/services/${ctx.serviceId}`,
        body: { description: 'Updated service description' },
      }),
      expect: (res) => [
        statusIs(res, 200),
        eq('descrição atualizada', (res.json as JsonBody)?.['description'], 'Updated service description'),
      ],
    },
  ],

  teardown: async (ctx) => {
    // Cleanup the category
    if (ctx.categoryId) {
      await request('DELETE', `/categories/${ctx.categoryId}`);
    }
  },
};

export default [serviceFlow];

if (process.argv[1]?.endsWith('service.flow.ts')) {
  const { runAll } = await import('./lib/runner.ts');
  await runAll([serviceFlow]);
}
