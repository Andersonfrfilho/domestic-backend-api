import { DataSource } from 'typeorm';
import { MongoClient } from 'mongodb';

import { loadSeedConfig } from './lib/config';
import { createEmptyContext } from './lib/context';
import { createPostgresDataSource } from './lib/postgres';
import { createMongoClient, getMongoDbName } from './lib/mongo';

import { seedKeycloak } from './seeders/00-keycloak.seeder';
import { seedCategories } from './seeders/01-category.seeder';
import { seedServices } from './seeders/02-service.seeder';
import { seedEmails } from './seeders/03-email.seeder';
import { seedPhones } from './seeders/04-phone.seeder';
import { seedAddresses } from './seeders/05-address.seeder';
import { seedUsers } from './seeders/06-user.seeder';
import { seedUserEmails } from './seeders/07-user-email.seeder';
import { seedUserPhones } from './seeders/08-user-phone.seeder';
import { seedUserAddresses } from './seeders/09-user-address.seeder';
import { seedDocuments } from './seeders/10-document.seeder';
import { seedProviderProfiles } from './seeders/11-provider-profile.seeder';
import { seedProviderEmails } from './seeders/12-provider-email.seeder';
import { seedProviderPhones } from './seeders/13-provider-phone.seeder';
import { seedProviderAddresses } from './seeders/14-provider-address.seeder';
import { seedProviderServices } from './seeders/15-provider-service.seeder';
import { seedProviderWorkLocations } from './seeders/16-provider-work-location.seeder';
import { seedProviderVerifications } from './seeders/17-provider-verification.seeder';
import { seedProviderVerificationLogs } from './seeders/18-provider-verification-log.seeder';
import { seedProviderDocuments } from './seeders/19-provider-document.seeder';
import { seedServiceRequests } from './seeders/20-service-request.seeder';
import { seedReviews } from './seeders/21-review.seeder';
import { seedNotifications } from './seeders/22-notification.seeder';
import { seedProviderPaymentMethods } from './seeders/23-provider-payment-method.seeder';
import { seedProviderAvailability } from './seeders/24-provider-availability.seeder';
import { seedCompanies } from './seeders/25-company.seeder';

const RESET  = '\x1b[0m';
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const CYAN   = '\x1b[36m';
const BOLD   = '\x1b[1m';
const DIM    = '\x1b[2m';
const YELLOW = '\x1b[33m';
const BLUE   = '\x1b[34m';

const startedAt = Date.now();

function elapsed(): string {
  return `${((Date.now() - startedAt) / 1000).toFixed(2)}s`;
}

function log(msg: string) {
  const ts = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
  process.stdout.write(`${DIM}[${ts}]${RESET} ${msg}\n`);
}

function running(label: string) {
  process.stdout.write(`${DIM}[${new Date().toISOString().slice(11, 23)}]${RESET}  ${BLUE}→${RESET} ${label.padEnd(35)} `);
}

function ok(count: number, ms: number) {
  process.stdout.write(`${GREEN}✓${RESET} ${DIM}${count} rows  +${ms}ms${RESET}\n`);
}

function fail(err: unknown) {
  process.stdout.write(`${RED}✗ ${(err as Error).message}${RESET}\n`);
  if ((err as Error).stack) {
    const lines = ((err as Error).stack ?? '').split('\n').slice(1, 4);
    for (const l of lines) process.stdout.write(`${DIM}    ${l.trim()}${RESET}\n`);
  }
}

interface Step {
  name: string;
  fn: () => Promise<number>;
}

async function runStep(step: Step): Promise<boolean> {
  running(step.name);
  const t0 = Date.now();
  try {
    const count = await step.fn();
    ok(count, Date.now() - t0);
    return true;
  } catch (err) {
    fail(err);
    return false;
  }
}

async function main() {
  const cfg = loadSeedConfig();
  const ctx = createEmptyContext();

  const providerCount = Math.round(cfg.users * cfg.providersRatio);

  console.log(`\n${BOLD}${CYAN}▶ Domestic Backend — Database Seeder${RESET}`);
  console.log('─'.repeat(60));
  console.log(`${DIM}  Env file             : ${process.env.DOTENV_CONFIG_PATH ?? '.env'}`);
  console.log(`  DB host (PG)         : ${process.env.DATABASE_POSTGRES_HOST ?? 'localhost'}:${process.env.DATABASE_POSTGRES_PORT ?? 5432}`);
  console.log(`  DB name  (PG)        : ${process.env.DATABASE_POSTGRES_NAME ?? 'backend_database_postgres'}`);
  console.log(`  DB host (Mongo)      : ${process.env.DATABASE_MONGO_HOST ?? 'localhost'}:${process.env.DATABASE_MONGO_PORT ?? 27017}${RESET}`);
  console.log('─'.repeat(60));
  console.log(`${DIM}  SEED_CATEGORIES           = ${cfg.categories}`);
  console.log(`  SEED_SERVICES_PER_CATEGORY = ${cfg.servicesPerCategory}  → ${cfg.categories * cfg.servicesPerCategory} services`);
  console.log(`  SEED_USERS                 = ${cfg.users}`);
  console.log(`  SEED_PROVIDERS_RATIO       = ${cfg.providersRatio}  → ${providerCount} providers`);
  console.log(`  SEED_SERVICE_REQUESTS      = ${cfg.serviceRequests}`);
  console.log(`  SEED_NOTIFICATIONS         = ${cfg.notifications}${RESET}\n`);

  let ds: DataSource | null = null;
  let mongo: MongoClient | null = null;

  // ── Keycloak ──────────────────────────────────────────────────
  console.log(`\n${BOLD}  Keycloak${RESET}`);
  console.log('─'.repeat(60));
  const kcStep: Step = {
    name: '00 Keycloak Users',
    fn: async () => { await seedKeycloak(ctx); return ctx.keycloakUsers.length; },
  };
  const kcPassed = await runStep(kcStep);
  if (!kcPassed) {
    console.log(`${BOLD}${RED}  Keycloak seeder failed — aborting.${RESET}\n`);
    process.exit(1);
  }

  // ── Connections ──────────────────────────────────────────────
  log(`Connecting to PostgreSQL...`);
  try {
    ds = createPostgresDataSource();
    await ds.initialize();
    log(`${GREEN}PostgreSQL connected${RESET}`);
  } catch (err) {
    log(`${RED}PostgreSQL connection failed: ${(err as Error).message}${RESET}`);
    process.exit(1);
  }

  // ── Reset PostgreSQL (truncate all seed tables) ───────────────
  log(`Resetting PostgreSQL tables...`);
  try {
    await ds.query('SET session_replication_role = replica');
    const tables = [
      'reviews', 'service_requests', 'provider_payment_methods', 'provider_documents',
      'provider_verification_logs', 'provider_verifications', 'provider_work_locations',
      'provider_services', 'provider_addresses', 'provider_phones', 'provider_emails',
      'provider_profiles', 'user_documents', 'documents', 'user_addresses', 'user_phones',
      'user_emails', 'users', 'addresses', 'phones', 'emails', 'services', 'categories',
      'company_providers', 'company_members', 'company_business_hours',
      'company_phones', 'company_emails', 'company_addresses', 'companies',
    ];
    for (const table of tables) {
      await ds.query(`TRUNCATE TABLE "${table}" CASCADE`);
    }
    await ds.query('SET session_replication_role = DEFAULT');
    log(`${GREEN}PostgreSQL tables reset${RESET}`);
  } catch (err) {
    log(`${YELLOW}Reset warning (non-fatal): ${(err as Error).message}${RESET}`);
    await ds.query('SET session_replication_role = DEFAULT').catch(() => {});
  }

  log(`Connecting to MongoDB...`);
  try {
    mongo = createMongoClient();
    await mongo.connect();
    log(`${GREEN}MongoDB connected${RESET}`);
  } catch (err) {
    log(`${RED}MongoDB connection failed: ${(err as Error).message}${RESET}`);
    await ds.destroy();
    process.exit(1);
  }

  // ── Reset MongoDB collections ─────────────────────────────────
  try {
    const dbName = getMongoDbName();
    const db = mongo.db(dbName);
    for (const col of ['notifications']) {
      await db.collection(col).deleteMany({});
    }
    log(`${GREEN}MongoDB collections reset${RESET}`);
  } catch (err) {
    log(`${YELLOW}MongoDB reset warning (non-fatal): ${(err as Error).message}${RESET}`);
  }

  // ── PostgreSQL seeders ────────────────────────────────────────
  console.log(`\n${BOLD}  PostgreSQL${RESET}`);
  console.log('─'.repeat(60));

  const pgSteps: Step[] = [
    { name: '01 Categories',              fn: async () => { await seedCategories(ds!, ctx, cfg);              return ctx.categories.length; } },
    { name: '02 Services',                fn: async () => { await seedServices(ds!, ctx, cfg);                return ctx.services.length; } },
    { name: '03 Emails',                  fn: async () => { await seedEmails(ds!, ctx, cfg);                  return ctx.emails.length; } },
    { name: '04 Phones',                  fn: async () => { await seedPhones(ds!, ctx, cfg);                  return ctx.phones.length; } },
    { name: '05 Addresses',              fn: async () => { await seedAddresses(ds!, ctx, cfg);               return ctx.addresses.length; } },
    { name: '06 Users',                   fn: async () => { await seedUsers(ds!, ctx, cfg);                   return ctx.users.length; } },
    { name: '07 User Emails',             fn: async () => { await seedUserEmails(ds!, ctx, cfg);              return ctx.userEmails.length; } },
    { name: '08 User Phones',             fn: async () => { await seedUserPhones(ds!, ctx, cfg);              return ctx.userPhones.length; } },
    { name: '09 User Addresses',          fn: async () => { await seedUserAddresses(ds!, ctx, cfg);           return ctx.userAddresses.length; } },
    { name: '10 Documents',              fn: async () => { await seedDocuments(ds!, ctx, cfg);               return ctx.documents.length; } },
    { name: '11 Provider Profiles',       fn: async () => { await seedProviderProfiles(ds!, ctx, cfg);        return ctx.providers.length; } },
    { name: '12 Provider Emails',         fn: async () => { await seedProviderEmails(ds!, ctx, cfg);          return ctx.providerEmails.length; } },
    { name: '13 Provider Phones',         fn: async () => { await seedProviderPhones(ds!, ctx, cfg);          return ctx.providerPhones.length; } },
    { name: '14 Provider Addresses',      fn: async () => { await seedProviderAddresses(ds!, ctx, cfg);       return ctx.providerAddresses.length; } },
    { name: '15 Provider Services',       fn: async () => { await seedProviderServices(ds!, ctx, cfg);        return ctx.providerServices.length; } },
    { name: '16 Provider Work Locations', fn: async () => { await seedProviderWorkLocations(ds!, ctx, cfg);   return ctx.providerWorkLocations.length; } },
    { name: '17 Provider Verifications',  fn: async () => { await seedProviderVerifications(ds!, ctx, cfg);   return ctx.providerVerifications.length; } },
    { name: '18 Verification Logs',       fn: async () => { await seedProviderVerificationLogs(ds!, ctx, cfg); return ctx.providerVerificationLogs.length; } },
    { name: '19 Provider Documents',      fn: async () => { await seedProviderDocuments(ds!, ctx, cfg);       return ctx.providerDocuments.length; } },
    { name: '20 Service Requests',        fn: async () => { await seedServiceRequests(ds!, ctx, cfg);         return ctx.serviceRequests.length; } },
    { name: '21 Reviews',                 fn: async () => { await seedReviews(ds!, ctx, cfg);                 return ctx.reviews.length; } },
    { name: '23 Provider Payment Methods',  fn: async () => { await seedProviderPaymentMethods(ds, ctx, cfg);  return ctx.providerPaymentMethods.length; } },
    { name: '24 Provider Availability',     fn: async () => { await seedProviderAvailability(ds!, ctx, cfg);   return ctx.providerAvailability.length; } },
    { name: '25 Companies',                 fn: async () => { await seedCompanies(ds!, ctx, cfg);               return ctx.companies.length; } },
  ];

  let failed = 0;
  for (const step of pgSteps) {
    const passed = await runStep(step);
    if (!passed) failed++;
  }

  // ── MongoDB seeders ───────────────────────────────────────────
  console.log(`\n${BOLD}  MongoDB${RESET}`);
  console.log('─'.repeat(60));

  const mongoStep: Step = {
    name: '22 Notifications',
    fn: async () => { await seedNotifications(mongo!, ctx, cfg); return ctx.notificationsInserted; },
  };
  const mongoPassed = await runStep(mongoStep);
  if (!mongoPassed) failed++;

  // ── Summary ───────────────────────────────────────────────────
  await ds.destroy();
  await mongo!.close();

  const totalRows =
    ctx.keycloakUsers.length +
    ctx.categories.length + ctx.services.length + ctx.emails.length + ctx.phones.length +
    ctx.addresses.length + ctx.users.length + ctx.userEmails.length + ctx.userPhones.length +
    ctx.userAddresses.length + ctx.documents.length + ctx.providers.length +
    ctx.providerEmails.length + ctx.providerPhones.length + ctx.providerAddresses.length +
    ctx.providerServices.length + ctx.providerWorkLocations.length + ctx.providerVerifications.length +
    ctx.providerVerificationLogs.length + ctx.providerDocuments.length +
    ctx.serviceRequests.length + ctx.reviews.length + ctx.providerPaymentMethods.length +
    ctx.companies.length + ctx.companyAddresses.length + ctx.companyEmails.length +
    ctx.companyPhones.length + ctx.companyBusinessHours.length + ctx.companyMembers.length +
    ctx.companyProviders.length + ctx.notificationsInserted;

  console.log('\n' + '─'.repeat(60));
  console.log(`${DIM}  Total rows inserted  : ${totalRows}`);
  console.log(`  Elapsed              : ${elapsed()}${RESET}`);

  if (failed === 0) {
    console.log(`${BOLD}${GREEN}  All seeders completed successfully.${RESET}\n`);
  } else {
    console.log(`${BOLD}${YELLOW}  Completed with ${failed} error(s). Check output above.${RESET}\n`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`\n${RED}Unexpected error: ${(err as Error).message}${RESET}`);
  if (err.stack) console.error(`${DIM}${err.stack}${RESET}`);
  process.exit(1);
});
