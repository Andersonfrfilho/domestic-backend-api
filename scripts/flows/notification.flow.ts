/**
 * Notification Flow — Spec-Driven
 *
 * Fluxos cobertos:
 *   1. Listar notificações do usuário
 *   2. Marcar primeira notificação como lida (se houver)
 *   3. Verificar que notificação está marcada como lida
 *
 * Notificações são geradas por eventos do sistema (ex: service request accepted).
 * O flow verifica que os endpoints respondem corretamente mesmo com lista vazia.
 */

import { getServiceToken, getUserToken } from './lib/auth.ts';
import { request, type Flow, type Assertion, type RequestResponse } from './lib/runner.ts';

interface NotificationFlowCtx {
  serviceToken: string;
  userToken: string;
  notificationId: string;
}

type JsonBody = Record<string, unknown> | null;

function authHeaders(ctx: NotificationFlowCtx): Record<string, string> {
  return { Authorization: `Bearer ${ctx.serviceToken}`, 'X-Access-Token': ctx.userToken };
}

function ok(label: string, value: unknown): Assertion {
  return { label, ok: !!value, detail: value == null ? 'got null/undefined' : String(value) };
}

function statusIs(res: RequestResponse, ...codes: number[]): Assertion {
  return { label: `status ${codes.join(' or ')}`, ok: codes.includes(res.status), detail: `got ${res.status}` };
}

const notificationFlow: Flow<NotificationFlowCtx> = {
  name: 'Notification Flow',

  setup: async (ctx) => {
    ctx.serviceToken = await getServiceToken();
    ctx.userToken = await getUserToken(
      process.env.KC_USER ?? 'contractor-test',
      process.env.KC_PASSWORD ?? 'ChangeMeSecurePassword123!',
    );
  },

  steps: [
    // ── 01 listar notificações ────────────────────────────────────────────────
    {
      name: 'GET /notifications — listar',
      request: (ctx) => ({
        method: 'GET',
        path: '/notifications',
        headers: authHeaders(ctx),
      }),
      expect: (res) => {
        const body = res.json as unknown[];
        const isArray = Array.isArray(body);
        return [
          statusIs(res, 200),
          { label: 'retorna array', ok: isArray, detail: `got ${typeof body}` },
        ];
      },
      capture: (res, ctx) => {
        const list = res.json as JsonBody[] | null;
        if (Array.isArray(list) && list.length > 0) {
          const unread = list.find(n => !n?.['read']);
          ctx.notificationId = (unread ?? list[0])?.['_id'] as string ?? (unread ?? list[0])?.['id'] as string;
        }
      },
    },

    // ── 02 marcar como lida ───────────────────────────────────────────────────
    {
      name: (ctx) => `PUT /notifications/${ctx.notificationId}/read`,
      skip: (ctx) => !ctx.notificationId,
      request: (ctx) => ({
        method: 'PUT',
        path: `/notifications/${ctx.notificationId}/read`,
        headers: authHeaders(ctx),
      }),
      expect: (res) => [statusIs(res, 204)],
      required: false,
    },

    // ── 03 verificar que está lida ────────────────────────────────────────────
    {
      name: 'GET /notifications — verificar leitura',
      skip: (ctx) => !ctx.notificationId,
      request: (ctx) => ({
        method: 'GET',
        path: '/notifications',
        headers: authHeaders(ctx),
      }),
      expect: (res, ctx) => {
        const list = res.json as JsonBody[] | null;
        const notification = Array.isArray(list)
          ? list.find(n => (n?.['_id'] ?? n?.['id']) === ctx.notificationId)
          : null;
        return [
          statusIs(res, 200),
          { label: 'notificação marcada como lida', ok: notification?.['read'] === true, detail: `read=${notification?.['read']}` },
        ];
      },
      required: false,
    },
  ],
};

export default [notificationFlow];

if (process.argv[1]?.endsWith('notification.flow.ts')) {
  const { runAll } = await import('./lib/runner.ts');
  await runAll([notificationFlow]);
}
