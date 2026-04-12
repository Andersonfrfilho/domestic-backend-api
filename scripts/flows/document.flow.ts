/**
 * Document Flow — Spec-Driven
 *
 * Fluxos cobertos:
 *   1. Prestador faz upload de documento (CPF)
 *   2. Prestador faz upload de foto de conclusão
 *   3. Buscar URL assinada do documento
 *   4. Admin aprova documento
 *   5. Admin rejeita documento
 *
 * Usa o usuário provider (KC_PROVIDER_USER) para uploads.
 */

import { getServiceToken, getUserToken } from './lib/auth.ts';
import { request, type Flow, type Assertion, type RequestResponse } from './lib/runner.ts';

interface DocumentFlowCtx {
  serviceToken: string;
  providerToken: string;
  documentCpfId: string;
  documentPhotoId: string;
}

type JsonBody = Record<string, unknown> | null;

function providerHeaders(ctx: DocumentFlowCtx): Record<string, string> {
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

// Minimal valid PDF content
function fakePdfBlob(name: string): [Blob, string] {
  const content = '%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 3 3]>>endobj\nxref\n0 4\n0000000000 65535 f \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n%%EOF';
  return [new Blob([content], { type: 'application/pdf' }), name];
}

// Minimal JPEG (magic bytes + EOI marker)
function fakeJpegBlob(name: string): [Blob, string] {
  const bytes = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0xff, 0xd9]);
  return [new Blob([bytes], { type: 'image/jpeg' }), name];
}

const documentFlow: Flow<DocumentFlowCtx> = {
  name: 'Document Upload & Approval Flow',

  setup: async (ctx) => {
    ctx.serviceToken = await getServiceToken();
    ctx.providerToken = await getUserToken(
      process.env.KC_PROVIDER_USER ?? 'provider-test',
      process.env.KC_PROVIDER_PASSWORD ?? 'ChangeMeSecurePassword123!',
    );
  },

  steps: [
    // ── 01 upload de CPF (PDF) ────────────────────────────────────────────────
    {
      name: 'POST /documents — upload CPF (PDF)',
      request: (ctx) => {
        const [blob, filename] = fakePdfBlob('cpf.pdf');
        const form = new FormData();
        form.append('file', blob, filename);
        form.append('documentType', 'CPF');
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
          eq('documentType CPF', body?.['documentType'], 'CPF'),
          eq('status PENDING', body?.['status'], 'PENDING'),
          ok('documentUrl presente', body?.['documentUrl']),
        ];
      },
      capture: (res, ctx) => {
        ctx.documentCpfId = (res.json as JsonBody)?.['id'] as string;
      },
      required: true,
    },

    // ── 02 upload de foto (JPEG) ──────────────────────────────────────────────
    {
      name: 'POST /documents — upload foto de identidade (JPEG)',
      request: (ctx) => {
        const [blob, filename] = fakeJpegBlob('identidade.jpg');
        const form = new FormData();
        form.append('file', blob, filename);
        form.append('documentType', 'RG');
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
          eq('documentType RG', body?.['documentType'], 'RG'),
          eq('status PENDING', body?.['status'], 'PENDING'),
        ];
      },
      capture: (res, ctx) => {
        ctx.documentPhotoId = (res.json as JsonBody)?.['id'] as string;
      },
      required: false,
    },

    // ── 03 buscar URL assinada do CPF ─────────────────────────────────────────
    {
      name: (ctx) => `GET /documents/${ctx.documentCpfId}/url`,
      request: (ctx) => ({
        method: 'GET',
        path: `/documents/${ctx.documentCpfId}/url`,
        headers: providerHeaders(ctx),
      }),
      expect: (res) => {
        const body = res.json as JsonBody;
        return [
          statusIs(res, 200),
          ok('url presente', body?.['url']),
          ok('expiresIn presente', body?.['expiresIn']),
        ];
      },
    },

    // ── 04 admin aprova CPF ───────────────────────────────────────────────────
    {
      name: (ctx) => `PUT /documents/${ctx.documentCpfId}/approve`,
      request: (ctx) => ({
        method: 'PUT',
        path: `/documents/${ctx.documentCpfId}/approve`,
        headers: providerHeaders(ctx),
      }),
      expect: (res) => [
        statusIs(res, 200),
        eq('status APPROVED', (res.json as JsonBody)?.['status'], 'APPROVED'),
      ],
      required: false,
    },

    // ── 05 admin rejeita RG ───────────────────────────────────────────────────
    {
      name: (ctx) => `PUT /documents/${ctx.documentPhotoId}/reject`,
      skip: (ctx) => !ctx.documentPhotoId,
      request: (ctx) => ({
        method: 'PUT',
        path: `/documents/${ctx.documentPhotoId}/reject`,
        headers: providerHeaders(ctx),
      }),
      expect: (res) => [
        statusIs(res, 200),
        eq('status REJECTED', (res.json as JsonBody)?.['status'], 'REJECTED'),
      ],
      required: false,
    },
  ],
};

export default [documentFlow];

if (process.argv[1]?.endsWith('document.flow.ts')) {
  const { runAll } = await import('./lib/runner.ts');
  await runAll([documentFlow]);
}
