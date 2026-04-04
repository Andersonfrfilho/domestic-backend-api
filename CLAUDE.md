# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:dev           # Watch mode
npm run start:dev:local     # Load .env.dev.local and watch

# Testing
npm run test:unit           # Unit tests (*.unit.spec.ts)
npm run test:unit:watch     # Unit tests watch mode
npm run test:unit:cov       # Unit tests with coverage report
npm run test:e2e            # E2E tests (*.e2e.spec.ts) — requires running services
npm run test:all            # Both unit and E2E

# Code quality
npm run lint                # Fix ESLint issues + import order
npm run lint:check          # Check without fixing
npm run format:all          # Prettier + lint

# Database migrations
npm run migration:run       # Apply pending migrations
npm run migration:revert    # Rollback last migration
npm run migration:generate  # Generate migration from entity changes
npm run migration:show      # Show migration status

# Full stack via Docker
make all                    # Full setup: all services + migrations
make app                    # API container only
make test-e2e-ready         # Prepare test DB and run E2E tests
make clean-all              # Full teardown
```

## Architecture

**Stack:** NestJS 11 on Fastify, TypeScript, TypeORM + PostgreSQL (primary), MongoDB (secondary), Redis (cache), RabbitMQ (queuing), Keycloak (OAuth2/OIDC).

**Domain:** A service marketplace platform (consumer Users, Provider profiles, Services, ServiceRequests, Reviews, geo-based work locations).

### Module structure

```
src/modules/
├── error/          # Cross-cutting error handling
├── shared/         # Infrastructure: DB, cache, queue, logging, middleware
├── user/           # User management
├── phone/          # Phone management
└── health/         # Health check
```

### Layered pattern (per module)

```
Controller → Service → UseCase → Repository → Database
```

Each business operation has its own Use Case class (e.g., `UserApplicationCreateUseCase`). Services orchestrate use cases. Repositories are interface-backed and injected via string tokens (e.g., `USER_REPOSITORY_PROVIDE` in `user.token.ts`).

### Error handling

All errors flow through `AppErrorFactory` → `AppError` → `HttpExceptionFilter`. Domain-specific error codes live in `modules/error/error-codes/` (e.g., `user.error-codes.ts`, `auth.error-codes.ts`).

### Dependency injection

Modules use explicit string token constants (defined in `*.token.ts` files) rather than class references for service/repository injection. This enables interface-based contracts and easier testing.

### Authentication

Keycloak is the primary auth provider via `@adatechnology/auth-keycloak`. The `User` entity stores a `keycloak_id` field for identity federation. JWT handling is secondary and delegated to Keycloak's token introspection.

### Caching

Redis cache via `@adatechnology/cache` (encryption-aware). Cache invalidation is explicit and manual at the controller level — there is no automatic invalidation on mutation.

### Environment configuration

All env vars are validated at startup via Joi schema in `src/config/env.validation.ts`. This is the authoritative reference for all config options. E2E tests use a separate `.env.e2e` file pointing to isolated databases (`backend_database_postgres_test_e2e`).

### TypeScript path aliases

```
@app/*      → src/*
@config/*   → src/config/*
@modules/*  → src/modules/*
```

### Testing conventions

- Unit test files: `*.unit.spec.ts`
- E2E test files: `*.e2e.spec.ts` under `test/e2e/`
- E2E tests cover auth, health, swagger, shared — user/phone modules need expansion
- Coverage thresholds: 50% functions/lines/statements (excludes configs, migrations, enums, DTOs)
- E2E tests include load/stress testing (10–50 concurrent) and performance benchmarks (< 200ms targets)
