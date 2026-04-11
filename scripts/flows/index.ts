/**
 * Flow runner — Spec-Driven integration tests
 *
 * Usage:
 *   node scripts/flows/index.ts            # roda todos os flows
 *   node scripts/flows/index.ts user       # roda só o módulo user
 *
 * Env vars (opcionais, defaults para local):
 *   BASE_URL      http://localhost:3333/v1
 *   KC_URL        http://localhost:8080
 *   KC_REALM      domestic-backend
 *   KC_USER       contractor-test
 *   KC_PASSWORD   ChangeMeSecurePassword123!
 */

import { runAll, type Flow } from './lib/runner.ts';
import userFlows from './user.flow.ts';

const MODULES: Record<string, Flow[]> = {
  user: userFlows,
};

async function main(): Promise<void> {
  const target = process.argv[2];

  let flows: Flow[];
  if (target) {
    if (!MODULES[target]) {
      console.error(`Unknown module: "${target}". Available: ${Object.keys(MODULES).join(', ')}`);
      process.exit(1);
    }
    flows = MODULES[target];
  } else {
    flows = Object.values(MODULES).flat();
  }

  await runAll(flows);
}

main().catch((err: unknown) => {
  console.error('Fatal:', err);
  process.exit(1);
});
