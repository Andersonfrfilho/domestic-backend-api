import { execSync } from 'child_process';
import * as path from 'path';

const COMPOSE_FILE = path.join(__dirname, '../../docker-compose.test.yml');
const COMPOSE_CMD = `docker compose -f "${COMPOSE_FILE}"`;

export default async function globalTeardown(): Promise<void> {
  console.log('\n🧹 Tearing down E2E test infrastructure...');

  execSync(`${COMPOSE_CMD} down -v --remove-orphans`, {
    stdio: 'inherit',
    timeout: 30_000,
  });

  console.log('✅ E2E infrastructure removed.\n');
}
