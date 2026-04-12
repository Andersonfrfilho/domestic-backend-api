/**
 * Review Flow — Spec-Driven
 *
 * Fluxos cobertos:
 *   1. Setup: cria provider + serviço + endereço + solicita + aceita + conclui
 *   2. Contratante cria avaliação
 *   3. Listar avaliações do prestador
 *   4. Tentar criar avaliação duplicada (deve retornar 409)
 *
 * Requer dois usuários Keycloak:
 *   KC_USER / KC_PASSWORD                    → contratante (default: contractor-test)
 *   KC_PROVIDER_USER / KC_PROVIDER_PASSWORD  → prestador   (default: provider-test)
 *                                              provider-test tem role manage-services e faz auto-aprovação no setup
 */

import { getServiceToken, getUserToken, decodeJwtPayload } from './lib/auth.ts';
import { request, type Flow, type Assertion, type RequestResponse } from './lib/runner.ts';

interface ReviewFlowCtx {
  serviceToken: string;
  contractorToken: string;
  providerToken: string;
  contractorUserId: string;
  providerUserId: string;
  providerProfileId: string;
  categoryId: string;
  catalogServiceId: string;
  addressId: string;
  userAddressId: string;
  serviceRequestId: string;
  reviewId: string;
}

type JsonBody = Record<string, unknown> | null;

function contractorHeaders(ctx: ReviewFlowCtx): Record<string, string> {
  return { Authorization: `Bearer ${ctx.serviceToken}`, 'X-Access-Token': ctx.contractorToken };
}

function providerHeaders(ctx: ReviewFlowCtx): Record<string, string> {
  return { Authorization: `Bearer ${ctx.serviceToken}`, 'X-Access-Token': ctx.providerToken };
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

const reviewFlow: Flow<ReviewFlowCtx> = {
  name: 'Review Flow',

  setup: async (ctx) => {
    ctx.serviceToken = await getServiceToken();
    ctx.contractorToken = await getUserToken(
      process.env.KC_USER ?? 'contractor-test',
      process.env.KC_PASSWORD ?? 'ChangeMeSecurePassword123!',
    );
    ctx.providerToken = await getUserToken(
      process.env.KC_PROVIDER_USER ?? 'provider-test',
      process.env.KC_PROVIDER_PASSWORD ?? 'ChangeMeSecurePassword123!',
    );

    const providerPayload = decodeJwtPayload<{ sub: string }>(ctx.providerToken);

    // Resolve contractor userId
    const meRes = await request('GET', '/users/me', { headers: contractorHeaders(ctx) });
    ctx.contractorUserId = (meRes.json as JsonBody)?.['id'] as string;

    // Create/resolve provider DB user
    const providerUserRes = await request('POST', '/users', {
      body: { fullName: 'Prestador Review Test', keycloakId: providerPayload.sub, status: 'ACTIVE' },
    });
    if (providerUserRes.status === 201 || providerUserRes.status === 200) {
      ctx.providerUserId = (providerUserRes.json as JsonBody)?.['id'] as string;
    } else if (providerUserRes.status === 409) {
      const meProviderRes = await request('GET', '/users/me', { headers: providerHeaders(ctx) });
      ctx.providerUserId = (meProviderRes.json as JsonBody)?.['id'] as string;
    }
    if (!ctx.providerUserId) throw new Error('Could not resolve provider DB user for review flow');

    // Create/resolve provider profile
    const profileRes = await request('POST', '/providers', {
      body: { userId: ctx.providerUserId, description: 'Prestador para review test' },
    });
    if (profileRes.status === 201 || profileRes.status === 200) {
      ctx.providerProfileId = (profileRes.json as JsonBody)?.['id'] as string;
    } else if (profileRes.status === 409) {
      const getRes = await request('GET', `/providers/user/${ctx.providerUserId}`);
      ctx.providerProfileId = (getRes.json as JsonBody)?.['id'] as string;
    }
    if (!ctx.providerProfileId) throw new Error('Could not resolve provider profile for review flow');

    // Ensure provider is approved (PENDING → UNDER_REVIEW → APPROVED)
    const verRes = await request('GET', `/providers/${ctx.providerProfileId}/verification`);
    const verStatus = (verRes.json as JsonBody)?.['status'] as string;
    if (verStatus === 'PENDING') {
      await request('POST', `/providers/${ctx.providerProfileId}/verification`);
    }
    if (verStatus !== 'APPROVED') {
      // provider-test has manage-services role — can self-approve in test setup
      await request('PUT', `/providers/${ctx.providerProfileId}/verification/approve`, {
        headers: { Authorization: `Bearer ${ctx.serviceToken}`, 'X-Access-Token': ctx.providerToken },
      });
    }

    // Category + service
    const catRes = await request('POST', '/categories', {
      body: { name: 'Review Test Cat', slug: `review-cat-${Date.now()}` },
    });
    ctx.categoryId = (catRes.json as JsonBody)?.['id'] as string;

    const svcRes = await request('POST', '/services', {
      body: { name: 'Review Test Svc', categoryId: ctx.categoryId },
    });
    ctx.catalogServiceId = (svcRes.json as JsonBody)?.['id'] as string;

    await request('POST', `/providers/${ctx.providerProfileId}/services`, {
      body: { serviceId: ctx.catalogServiceId, customPrice: 200 },
    });

    // Address
    const addrRes = await request('POST', '/users/me/addresses', {
      headers: contractorHeaders(ctx),
      body: {
        street: 'Rua da Avaliação',
        number: '10',
        neighborhood: 'Centro',
        city: 'Recife',
        state: 'PE',
        zipCode: '50010-000',
      },
    });
    ctx.userAddressId = (addrRes.json as JsonBody)?.['id'] as string;
    ctx.addressId = (addrRes.json as JsonBody)?.['addressId'] as string;

    // Create service request
    const srRes = await request('POST', '/service-requests', {
      headers: contractorHeaders(ctx),
      body: {
        providerId: ctx.providerProfileId,
        serviceId: ctx.catalogServiceId,
        addressId: ctx.addressId,
        description: 'Serviço para avaliação',
        priceFinal: 200,
      },
    });
    ctx.serviceRequestId = (srRes.json as JsonBody)?.['id'] as string;

    // Provider accepts
    await request('PUT', `/service-requests/${ctx.serviceRequestId}/accept`, {
      headers: providerHeaders(ctx),
    });

    // Contractor completes
    await request('PUT', `/service-requests/${ctx.serviceRequestId}/complete`, {
      headers: contractorHeaders(ctx),
    });
  },

  steps: [
    // ── 01 criar avaliação ────────────────────────────────────────────────────
    {
      name: 'POST /reviews — criar avaliação',
      request: (ctx) => ({
        method: 'POST',
        path: '/reviews',
        headers: contractorHeaders(ctx),
        body: {
          serviceRequestId: ctx.serviceRequestId,
          rating: 5,
          comment: 'Serviço excelente, muito pontual e cuidadoso!',
        },
      }),
      expect: (res) => {
        const body = res.json as JsonBody;
        return [
          statusIs(res, 201),
          ok('id presente', body?.['id']),
          eq('rating 5', body?.['rating'], 5),
          ok('comment presente', body?.['comment']),
        ];
      },
      capture: (res, ctx) => {
        ctx.reviewId = (res.json as JsonBody)?.['id'] as string;
      },
      required: true,
    },

    // ── 02 listar avaliações do prestador ─────────────────────────────────────
    {
      name: (ctx) => `GET /reviews/provider/${ctx.providerProfileId}`,
      request: (ctx) => ({
        method: 'GET',
        path: `/reviews/provider/${ctx.providerProfileId}`,
        headers: contractorHeaders(ctx),
      }),
      expect: (res) => [
        statusIs(res, 200),
        { label: 'retorna array', ok: Array.isArray(res.json), detail: `got ${typeof res.json}` },
        { label: 'pelo menos 1 avaliação', ok: Array.isArray(res.json) && (res.json as unknown[]).length > 0 },
      ],
    },

    // ── 03 avaliação duplicada deve ser rejeitada ──────────────────────────────
    {
      name: 'POST /reviews — duplicata deve retornar 409',
      request: (ctx) => ({
        method: 'POST',
        path: '/reviews',
        headers: contractorHeaders(ctx),
        body: {
          serviceRequestId: ctx.serviceRequestId,
          rating: 3,
          comment: 'Tentativa duplicada',
        },
      }),
      expect: (res) => [statusIs(res, 409, 400)],
      required: false,
    },
  ],

  teardown: async (ctx) => {
    if (ctx.userAddressId) {
      await request('DELETE', `/users/me/addresses/${ctx.userAddressId}`, { headers: contractorHeaders(ctx) });
    }
    if (ctx.categoryId) {
      await request('DELETE', `/categories/${ctx.categoryId}`);
    }
  },
};

export default [reviewFlow];

if (process.argv[1]?.endsWith('review.flow.ts')) {
  const { runAll } = await import('./lib/runner.ts');
  await runAll([reviewFlow]);
}
