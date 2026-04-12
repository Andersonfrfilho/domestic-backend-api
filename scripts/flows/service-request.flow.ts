/**
 * Service Request Flow — Spec-Driven
 *
 * Fluxos cobertos:
 *   1. Setup: cria provider + serviço + endereço do contratante
 *   2. Contratante cria solicitação de serviço
 *   3. Listar solicitações
 *   4. Buscar solicitação por ID
 *   5. Prestador aceita
 *   6. Prestador faz upload de foto de conclusão
 *   7. Contratante confirma conclusão
 *   8. Cancelar solicitação (flow separado, auto-suficiente)
 *
 * Requer dois usuários Keycloak:
 *   KC_USER / KC_PASSWORD                    → contratante (default: contractor-test)
 *   KC_PROVIDER_USER / KC_PROVIDER_PASSWORD  → prestador   (default: provider-test)
 *                                              provider-test tem role manage-services e faz auto-aprovação no setup
 */

import { getServiceToken, getUserToken, decodeJwtPayload } from './lib/auth.ts';
import { request, type Flow, type Assertion, type RequestResponse } from './lib/runner.ts';

interface ServiceRequestFlowCtx {
  serviceToken: string;
  contractorToken: string;
  providerToken: string;
  providerKeycloakId: string;
  contractorUserId: string;
  providerUserId: string;
  providerProfileId: string;
  categoryId: string;
  catalogServiceId: string;
  addressId: string;
  userAddressId: string;
  serviceRequestId: string;
  completionDocumentId: string;
}

type JsonBody = Record<string, unknown> | null;

function contractorHeaders(ctx: ServiceRequestFlowCtx): Record<string, string> {
  return { Authorization: `Bearer ${ctx.serviceToken}`, 'X-Access-Token': ctx.contractorToken };
}

function providerHeaders(ctx: ServiceRequestFlowCtx): Record<string, string> {
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

function fakeJpegBlob(name: string): [Blob, string] {
  const bytes = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0xff, 0xd9]);
  return [new Blob([bytes], { type: 'image/jpeg' }), name];
}

async function buildProviderSetup(ctx: ServiceRequestFlowCtx, slug: string): Promise<void> {
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
  ctx.providerKeycloakId = providerPayload.sub;

  // Resolve contractor userId
  const meRes = await request('GET', '/users/me', { headers: contractorHeaders(ctx) });
  ctx.contractorUserId = (meRes.json as JsonBody)?.['id'] as string;

  // Create or resolve provider DB user
  const providerUserRes = await request('POST', '/users', {
    body: { fullName: 'Prestador Teste', keycloakId: ctx.providerKeycloakId, status: 'ACTIVE' },
  });
  if (providerUserRes.status === 201 || providerUserRes.status === 200) {
    ctx.providerUserId = (providerUserRes.json as JsonBody)?.['id'] as string;
  } else if (providerUserRes.status === 409) {
    const meProviderRes = await request('GET', '/users/me', { headers: providerHeaders(ctx) });
    ctx.providerUserId = (meProviderRes.json as JsonBody)?.['id'] as string;
  }
  if (!ctx.providerUserId) throw new Error('Could not resolve provider DB user');

  // Create or resolve provider profile
  const profileRes = await request('POST', '/providers', {
    body: { userId: ctx.providerUserId, description: 'Prestador de testes automatizados' },
  });
  if (profileRes.status === 201 || profileRes.status === 200) {
    ctx.providerProfileId = (profileRes.json as JsonBody)?.['id'] as string;
  } else if (profileRes.status === 409) {
    const getRes = await request('GET', `/providers/user/${ctx.providerUserId}`);
    ctx.providerProfileId = (getRes.json as JsonBody)?.['id'] as string;
  }
  if (!ctx.providerProfileId) throw new Error('Could not resolve provider profile');

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

  // Create category + service
  const catRes = await request('POST', '/categories', {
    body: { name: `SR Cat ${slug}`, slug: `sr-cat-${slug}-${Date.now()}` },
  });
  ctx.categoryId = (catRes.json as JsonBody)?.['id'] as string;

  const svcRes = await request('POST', '/services', {
    body: { name: `SR Service ${slug}`, categoryId: ctx.categoryId },
  });
  ctx.catalogServiceId = (svcRes.json as JsonBody)?.['id'] as string;

  await request('POST', `/providers/${ctx.providerProfileId}/services`, {
    body: { serviceId: ctx.catalogServiceId, customPrice: 150 },
  });

  // Create address for contractor
  const addrRes = await request('POST', '/users/me/addresses', {
    headers: contractorHeaders(ctx),
    body: {
      street: 'Rua das Solicitações',
      number: '100',
      neighborhood: 'Centro',
      city: 'Fortaleza',
      state: 'CE',
      zipCode: '60010-000',
    },
  });
  ctx.userAddressId = (addrRes.json as JsonBody)?.['id'] as string;
  ctx.addressId = (addrRes.json as JsonBody)?.['addressId'] as string;
}

async function cleanupProviderSetup(ctx: ServiceRequestFlowCtx): Promise<void> {
  if (ctx.userAddressId) {
    await request('DELETE', `/users/me/addresses/${ctx.userAddressId}`, { headers: contractorHeaders(ctx) });
  }
  if (ctx.categoryId) {
    await request('DELETE', `/categories/${ctx.categoryId}`);
  }
}

// ── Flow principal ────────────────────────────────────────────────────────────
const serviceRequestFlow: Flow<ServiceRequestFlowCtx> = {
  name: 'Service Request Full Lifecycle Flow',

  setup: (ctx) => buildProviderSetup(ctx, 'lifecycle'),

  steps: [
    // ── 01 criar solicitação ──────────────────────────────────────────────────
    {
      name: 'POST /service-requests — criar solicitação',
      request: (ctx) => ({
        method: 'POST',
        path: '/service-requests',
        headers: contractorHeaders(ctx),
        body: {
          providerId: ctx.providerProfileId,
          serviceId: ctx.catalogServiceId,
          addressId: ctx.addressId,
          description: 'Preciso de faxina completa',
          priceFinal: 150,
        },
      }),
      expect: (res) => {
        const body = res.json as JsonBody;
        return [
          statusIs(res, 201),
          ok('id presente', body?.['id']),
          eq('status PENDING', body?.['status'], 'PENDING'),
        ];
      },
      capture: (res, ctx) => {
        ctx.serviceRequestId = (res.json as JsonBody)?.['id'] as string;
      },
      required: true,
    },

    // ── 02 listar solicitações ────────────────────────────────────────────────
    {
      name: 'GET /service-requests — listar',
      request: (ctx) => ({ method: 'GET', path: '/service-requests', headers: contractorHeaders(ctx) }),
      expect: (res) => [
        statusIs(res, 200),
        { label: 'retorna array', ok: Array.isArray(res.json), detail: `got ${typeof res.json}` },
      ],
    },

    // ── 03 buscar por ID ──────────────────────────────────────────────────────
    {
      name: (ctx) => `GET /service-requests/${ctx.serviceRequestId}`,
      request: (ctx) => ({
        method: 'GET',
        path: `/service-requests/${ctx.serviceRequestId}`,
        headers: contractorHeaders(ctx),
      }),
      expect: (res, ctx) => [
        statusIs(res, 200),
        eq('id correto', (res.json as JsonBody)?.['id'], ctx.serviceRequestId),
        eq('status PENDING', (res.json as JsonBody)?.['status'], 'PENDING'),
      ],
    },

    // ── 04 prestador aceita ───────────────────────────────────────────────────
    {
      name: (ctx) => `PUT /service-requests/${ctx.serviceRequestId}/accept`,
      request: (ctx) => ({
        method: 'PUT',
        path: `/service-requests/${ctx.serviceRequestId}/accept`,
        headers: providerHeaders(ctx),
      }),
      expect: (res) => [
        statusIs(res, 200),
        eq('status ACCEPTED', (res.json as JsonBody)?.['status'], 'ACCEPTED'),
      ],
    },

    // ── 05 prestador faz upload de foto de conclusão ──────────────────────────
    {
      name: (ctx) => `POST /documents — foto de conclusão (sr ${ctx.serviceRequestId})`,
      request: (ctx) => {
        const [blob, filename] = fakeJpegBlob('conclusao.jpg');
        const form = new FormData();
        form.append('file', blob, filename);
        form.append('documentType', 'COMPLETION_PHOTO');
        return {
          method: 'POST',
          path: '/documents',
          headers: providerHeaders(ctx),
          body: form,
        };
      },
      expect: (res) => {
        const body = res.json as JsonBody;
        return [
          statusIs(res, 201),
          ok('id presente', body?.['id']),
          eq('status PENDING', body?.['status'], 'PENDING'),
        ];
      },
      capture: (res, ctx) => {
        ctx.completionDocumentId = (res.json as JsonBody)?.['id'] as string;
      },
      required: false,
    },

    // ── 06 buscar URL assinada do documento ───────────────────────────────────
    {
      name: (ctx) => `GET /documents/${ctx.completionDocumentId}/url`,
      skip: (ctx) => !ctx.completionDocumentId,
      request: (ctx) => ({
        method: 'GET',
        path: `/documents/${ctx.completionDocumentId}/url`,
        headers: providerHeaders(ctx),
      }),
      expect: (res) => [
        statusIs(res, 200),
        ok('url presente', (res.json as JsonBody)?.['url']),
      ],
      required: false,
    },

    // ── 07 contratante confirma conclusão ─────────────────────────────────────
    {
      name: (ctx) => `PUT /service-requests/${ctx.serviceRequestId}/complete`,
      request: (ctx) => ({
        method: 'PUT',
        path: `/service-requests/${ctx.serviceRequestId}/complete`,
        headers: contractorHeaders(ctx),
      }),
      expect: (res) => [
        statusIs(res, 200),
        eq('status COMPLETED', (res.json as JsonBody)?.['status'], 'COMPLETED'),
      ],
    },
  ],

  teardown: (ctx) => cleanupProviderSetup(ctx),
};

// ── Flow de cancelamento ──────────────────────────────────────────────────────
const cancelFlow: Flow<ServiceRequestFlowCtx> = {
  name: 'Service Request Cancel Flow',

  setup: (ctx) => buildProviderSetup(ctx, 'cancel'),

  steps: [
    {
      name: 'POST /service-requests — criar para cancelar',
      request: (ctx) => ({
        method: 'POST',
        path: '/service-requests',
        headers: contractorHeaders(ctx),
        body: {
          providerId: ctx.providerProfileId,
          serviceId: ctx.catalogServiceId,
          addressId: ctx.addressId,
          description: 'Solicitação que será cancelada',
        },
      }),
      expect: (res) => [statusIs(res, 201), ok('id presente', (res.json as JsonBody)?.['id'])],
      capture: (res, ctx) => { ctx.serviceRequestId = (res.json as JsonBody)?.['id'] as string; },
      required: true,
    },
    {
      name: (ctx) => `PUT /service-requests/${ctx.serviceRequestId}/cancel`,
      request: (ctx) => ({
        method: 'PUT',
        path: `/service-requests/${ctx.serviceRequestId}/cancel`,
        headers: contractorHeaders(ctx),
      }),
      expect: (res) => [
        statusIs(res, 200),
        eq('status CANCELLED', (res.json as JsonBody)?.['status'], 'CANCELLED'),
      ],
    },
  ],

  teardown: (ctx) => cleanupProviderSetup(ctx),
};

export default [serviceRequestFlow, cancelFlow];

if (process.argv[1]?.endsWith('service-request.flow.ts')) {
  const { runAll } = await import('./lib/runner.ts');
  await runAll([serviceRequestFlow, cancelFlow]);
}
