/**
 * Category Module Flow — Spec-Driven
 *
 * Fluxos cobertos:
 *   1. Criar categoria → captura category_id
 *   2. Listar categorias
 *   3. Buscar por ID
 *   4. Atualizar categoria
 *   5. Deletar categoria (soft delete)
 */

import { request, type Flow, type Assertion, type RequestResponse } from './lib/runner.ts';

interface CategoryFlowCtx {
  categoryId: string;
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
  name: 'Test Category',
  slug: 'test-category-' + Date.now(),
  description: 'A test category description',
};

const categoryFlow: Flow<CategoryFlowCtx> = {
  name: 'Category CRUD Flow',

  steps: [
    // ── 01 criar categoria ────────────────────────────────────────────────────
    {
      name: 'POST /categories — criar categoria',
      request: () => ({
        method: 'POST',
        path: '/categories',
        body: testCategory,
      }),
      expect: (res) => {
        const body = res.json as JsonBody;
        return [
          statusIs(res, 201, 200),
          ok('id presente', body?.['id']),
          eq('name correto', body?.['name'], testCategory.name),
        ];
      },
      capture: (res, ctx) => {
        const body = res.json as JsonBody;
        if (body?.['id']) ctx.categoryId = body['id'] as string;
      },
      required: true,
    },

    // ── 02 listar categorias ──────────────────────────────────────────────────
    {
      name: 'GET /categories — listar categorias',
      request: () => ({ method: 'GET', path: '/categories' }),
      expect: (res) => {
        const body = res.json as unknown[];
        return [
          statusIs(res, 200),
          { label: 'retorna array', ok: Array.isArray(body) },
          { label: 'pelo menos 1 categoria', ok: Array.isArray(body) && body.length > 0 },
        ];
      },
    },

    // ── 03 buscar por id ──────────────────────────────────────────────────────
    {
      name: (ctx) => `GET /categories/${ctx.categoryId} — buscar por ID`,
      request: (ctx) => ({ method: 'GET', path: `/categories/${ctx.categoryId}` }),
      expect: (res, ctx) => {
        const body = res.json as JsonBody;
        return [
          statusIs(res, 200),
          eq('id correto', body?.['id'], ctx.categoryId),
        ];
      },
    },

    // ── 04 atualizar ──────────────────────────────────────────────────────────
    {
      name: (ctx) => `PUT /categories/${ctx.categoryId} — atualizar`,
      request: (ctx) => ({
        method: 'PUT',
        path: `/categories/${ctx.categoryId}`,
        body: { iconUrl: 'https://example.com/icon.png' },
      }),
      expect: (res) => [
        statusIs(res, 200),
        eq('iconUrl atualizado', (res.json as JsonBody)?.['iconUrl'], 'https://example.com/icon.png'),
      ],
    },

    // ── 05 deletar ────────────────────────────────────────────────────────────
    {
      name: (ctx) => `DELETE /categories/${ctx.categoryId} — deletar`,
      request: (ctx) => ({ method: 'DELETE', path: `/categories/${ctx.categoryId}` }),
      expect: (res) => [statusIs(res, 204)],
    },
  ],
};

export default [categoryFlow];

if (process.argv[1]?.endsWith('category.flow.ts')) {
  const { runAll } = await import('./lib/runner.ts');
  await runAll([categoryFlow]);
}
