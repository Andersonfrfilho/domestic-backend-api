export interface SeedConfig {
  categories: number;
  servicesPerCategory: number;
  users: number;
  providersRatio: number;
  serviceRequests: number;
  notifications: number;
}

function int(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) ? fallback : parsed;
}

function float(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = parseFloat(raw);
  return isNaN(parsed) ? fallback : parsed;
}

export function loadSeedConfig(): SeedConfig {
  return {
    categories: int('SEED_CATEGORIES', 12),
    servicesPerCategory: int('SEED_SERVICES_PER_CATEGORY', 5),
    users: int('SEED_USERS', 240),
    providersRatio: float('SEED_PROVIDERS_RATIO', 0.5),
    serviceRequests: int('SEED_SERVICE_REQUESTS', 300),
    notifications: int('SEED_NOTIFICATIONS', 300),
  };
}
