/**
 * Health Module Flow — Spec-Driven
 *
 * Fluxos cobertos:
 *   1. Health check (GET /health)
 */

import { request, type Flow, type Assertion, type RequestResponse } from './lib/runner.ts';

type JsonBody = Record<string, unknown> | null;

function statusIs(res: RequestResponse, ...codes: number[]): Assertion {
  return { label: `status ${codes.join(' or ')}`, ok: codes.includes(res.status), detail: `got ${res.status}` };
}

const BASE_URL = (process.env.BASE_URL ?? 'http://localhost:3333/v1').replace(/\/$/, '');
const ROOT_URL = BASE_URL.replace(/\/v\d+$/, '');

const healthFlow: Flow = {
  name: 'Health Check Flow',

  steps: [
    {
      name: 'GET /health',
      request: () => ({ method: 'GET', path: `${ROOT_URL}/health` }),
      expect: (res) => {
        const body = res.json as JsonBody;
        return [
          statusIs(res, 200),
          { label: 'status is ok', ok: body?.['status'] === 'ok', detail: String(body?.['status']) },
          { label: 'info is present', ok: !!body?.['info'] },
          { label: 'details is present', ok: !!body?.['details'] },
        ];
      },
    },
  ],
};

export default [healthFlow];

if (process.argv[1]?.endsWith('health.flow.ts')) {
  const { runAll } = await import('./lib/runner.ts');
  await runAll([healthFlow]);
}
