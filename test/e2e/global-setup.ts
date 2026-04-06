import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const COMPOSE_FILE = path.join(__dirname, '../../docker-compose.test.yml');
const COMPOSE_CMD = `docker compose -f "${COMPOSE_FILE}"`;
const PROJECT_ROOT = path.join(__dirname, '../..');

export default async function globalSetup(): Promise<void> {
  console.log('\n🐳 Starting E2E test infrastructure...');

  try {
    execSync(`${COMPOSE_CMD} down -v --remove-orphans`, { stdio: 'pipe' });
  } catch {
    // Ignorar se não existia
  }

  execSync(`${COMPOSE_CMD} up -d --wait`, {
    stdio: 'inherit',
    timeout: 120_000,
  });

  console.log('\n📦 Running migrations on test database...');

  const e2eEnvRaw = fs.readFileSync(path.join(PROJECT_ROOT, '.env.e2e'), 'utf8');
  const e2eEnv = Object.fromEntries(
    e2eEnvRaw
      .split('\n')
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const idx = line.indexOf('=');
        return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
      }),
  );

  execSync('npm run migration:run', {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
    env: { ...process.env, ...e2eEnv, NODE_ENV: 'test' },
    timeout: 60_000,
  });

  console.log('✅ E2E infrastructure is ready.\n');
}
