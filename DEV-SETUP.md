# Setup local — Domestic Backend

## Pré-requisitos
- Docker + Docker Compose
- Node.js 20+

## Fluxo completo (primeira vez)

```bash
# 1. Sobe infra essencial (postgres, mongo, redis, rabbitmq, keycloak, mailpit)
make dev-infra

# 2. Aguarda Keycloak ficar pronto (~30s) e roda migrations + seeds
make dev-all
```

`make dev-all` executa em sequência:
- `make dev-infra` — sobe os serviços Docker
- `make migrate-dev` — aplica migrations do PostgreSQL
- `make seed-dev` — cria usuários no Keycloak + popula PostgreSQL + MongoDB

## Rodando os serviços (cada um em um terminal)

```bash
# API (porta 3333)
cd domestic-backend-api && make dev

# BFF (porta 3335)
cd domestic-backend-bff && make dev
cd domestic-backend-bff && make seed-dev  # seed MongoDB (se necessário)

# Worker
cd domestic-backend-worker && make dev
```

## Usuários de teste

| Email | Senha | Tipo |
|---|---|---|
| `contractor-test@domestic.local` | `Test@12345` | Contractor (consumidor) |
| `provider-test@domestic.local` | `Test@12345` | Provider (pendente) |
| `provider-full@domestic.local` | `Test@12345` | Provider (completo) |
| `admin-test@domestic.local` | `Test@12345` | Admin |

## URLs locais

| Serviço | URL |
|---|---|
| API | http://localhost:3333 |
| BFF | http://localhost:3335 |
| Keycloak | http://localhost:8080 (admin/admin) |
| Mailpit | http://localhost:8025 |
| RabbitMQ | http://localhost:15672 |

## Mobile (Cawme)

Use `.env.local` no projeto Cawme:
```
EXPO_PUBLIC_BFF_URL=http://localhost:3335
EXPO_PUBLIC_WS_URL=http://localhost:3335
```

## Logs

Cada serviço gera logs em `.log/<nome>-<timestamp>.log`.
Esses arquivos são ignorados pelo git (`.log/` está no `.gitignore`).

## Parar tudo

```bash
cd domestic-backend-api && make dev-infra-stop
```
