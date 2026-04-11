# API Curls — Domestic Backend

> **App (direto):** `http://localhost:3333`
> **App (via Kong):** `http://localhost:8000`
> **Keycloak:** `http://localhost:8080`
> **Realm:** `domestic-backend`
> **Versão:** todas as rotas de negócio respondem em `/v1/...` (NestJS URI versioning)

---

## Clientes Keycloak disponíveis

| Client ID                 | Secret                         | Grant types                      | Quem usa                      |
| ------------------------- | ------------------------------ | -------------------------------- | ----------------------------- |
| `domestic-api`            | `api-client-secret`            | `client_credentials`, `password` | API backend (service account) |
| `domestic-backend-bff`    | `backend-bff-client-secret`    | `client_credentials`, `password` | BFF / testes manuais          |
| `domestic-backend-kong`   | `backend-kong-client-secret`   | `client_credentials`             | Kong gateway                  |
| `domestic-backend-worker` | `backend-worker-client-secret` | `client_credentials`             | Worker assíncrono             |
| `domestic-backend-cron`   | `backend-cron-client-secret`   | `client_credentials`             | Jobs agendados                |

## Usuários de teste

| Username          | Email                       | Senha                        | Roles                                                                     |
| ----------------- | --------------------------- | ---------------------------- | ------------------------------------------------------------------------- |
| `admin`           | `admin@domestic.local`      | `ChangeMeSecurePassword123!` | `admin`, `user-manager`, `service-manager`, `document-verifier`           |
| `contractor-test` | `contractor@domestic.local` | `ChangeMeSecurePassword123!` | `user-manager`, `manage-requests`, `manage-reviews`, `send-notifications` |
| `provider-test`   | `provider@domestic.local`   | `ChangeMeSecurePassword123!` | `user-manager`, `manage-requests`, `manage-services`, `manage-reviews`    |
| `support-test`    | `support@domestic.local`    | `ChangeMeSecurePassword123!` | `user-manager`, `document-verifier`, `send-notifications`                 |

---

## Contrato de headers

| Header           | Tipo                     | Quem injeta    | Descrição                                                                                 |
| ---------------- | ------------------------ | -------------- | ----------------------------------------------------------------------------------------- |
| `Authorization`  | `Bearer <service_token>` | Kong / serviço | Identidade do chamador (B2B). Token do client `domestic-api` via `client_credentials`.    |
| `X-Access-Token` | `<user_jwt>`             | Kong           | Token original do usuário (B2C). Claims (`sub`, `email`, roles) decodificados localmente. |

> **Não existem `X-User-Id` nem `X-User-Roles`.**
> Todos os dados do usuário vêm do JWT em `X-Access-Token`.

---

## Passo 1 — Obter tokens

### Token de serviço B2B — `client_credentials` (domestic-api)

> Representa a identidade da própria API. Enviado no header `Authorization` em chamadas diretas ao backend.

```bash
# Token do client domestic-api (service account da API)
# Endpoint: POST http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token
SERVICE_TOKEN=$(curl -s -X POST \
  'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=client_credentials' \
  -d 'client_id=domestic-api' \
  -d 'client_secret=api-client-secret' | jq -r '.access_token')

echo "SERVICE_TOKEN (domestic-api): ${SERVICE_TOKEN:0:80}..."
```

---

### Token de usuário B2C — `password` grant (por usuário)

> Simula o token que o BFF entregaria após login. Enviado no header `X-Access-Token`.
> Em produção esse fluxo é feito via PKCE — o `password` grant é apenas para testes locais.

#### Contratante — `contractor@domestic.local`

```bash
# Token do usuário contractor-test via client domestic-backend-bff
# Endpoint: POST http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token
USER_TOKEN=$(curl -s -X POST \
  'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password' \
  -d 'client_id=domestic-backend-bff' \
  -d 'client_secret=backend-bff-client-secret' \
  -d 'username=contractor-test' \
  -d 'password=ChangeMeSecurePassword123!' | jq -r '.access_token')

echo "USER_TOKEN (contractor@domestic.local): ${USER_TOKEN:0:80}..."
```

#### Prestador — `provider@domestic.local`

```bash
# Token do usuário provider-test via client domestic-backend-bff
# Endpoint: POST http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token
PROVIDER_TOKEN=$(curl -s -X POST \
  'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password' \
  -d 'client_id=domestic-backend-bff' \
  -d 'client_secret=backend-bff-client-secret' \
  -d 'username=provider-test' \
  -d 'password=ChangeMeSecurePassword123!' | jq -r '.access_token')

echo "PROVIDER_TOKEN (provider@domestic.local): ${PROVIDER_TOKEN:0:80}..."
```

#### Admin — `admin@domestic.local`

```bash
# Token do usuário admin via client domestic-backend-bff
# Endpoint: POST http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token
ADMIN_TOKEN=$(curl -s -X POST \
  'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password' \
  -d 'client_id=domestic-backend-bff' \
  -d 'client_secret=backend-bff-client-secret' \
  -d 'username=admin' \
  -d 'password=ChangeMeSecurePassword123!' | jq -r '.access_token')

echo "ADMIN_TOKEN (admin@domestic.local): ${ADMIN_TOKEN:0:80}..."
```

#### Suporte — `support@domestic.local`

```bash
# Token do usuário support-test via client domestic-backend-bff
# Endpoint: POST http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token
SUPPORT_TOKEN=$(curl -s -X POST \
  'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password' \
  -d 'client_id=domestic-backend-bff' \
  -d 'client_secret=backend-bff-client-secret' \
  -d 'username=support-test' \
  -d 'password=ChangeMeSecurePassword123!' | jq -r '.access_token')

echo "SUPPORT_TOKEN (support@domestic.local): ${SUPPORT_TOKEN:0:80}..."
```

---

### Renovar token (refresh)

```bash
# Endpoint: POST http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token
REFRESH_TOKEN='<refresh_token_aqui>'

NEW_TOKENS=$(curl -s -X POST \
  'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=refresh_token' \
  -d "refresh_token=$REFRESH_TOKEN" \
  -d 'client_id=domestic-backend-bff' \
  -d 'client_secret=backend-bff-client-secret')

USER_TOKEN=$(echo "$NEW_TOKENS" | jq -r '.access_token')
```

---

### Admin API — listar usuários e sub (keycloak_id)

```bash
# 1. Token do realm master (usuário admin do Keycloak, não do realm domestic-backend)
# Endpoint: POST http://localhost:8080/realms/master/protocol/openid-connect/token
KEYCLOAK_ADMIN_TOKEN=$(curl -s -X POST \
  'http://localhost:8080/realms/master/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password' \
  -d 'client_id=admin-cli' \
  -d 'username=admin' \
  -d 'password=admin' | jq -r '.access_token')

# 2. Listar usuários do realm domestic-backend com seus IDs (sub = keycloak_id)
# Endpoint: GET http://localhost:8080/admin/realms/domestic-backend/users
curl -s 'http://localhost:8080/admin/realms/domestic-backend/users' \
  -H "Authorization: Bearer $KEYCLOAK_ADMIN_TOKEN" \
  | jq '[.[] | {id, username, email}]'
```

### `/userinfo` — sub do token atual

```bash
# Endpoint: GET http://localhost:8080/realms/domestic-backend/protocol/openid-connect/userinfo
curl -s 'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/userinfo' \
  -H "Authorization: Bearer $USER_TOKEN" | jq '{sub, email, preferred_username}'
```

---

### Fluxo PKCE (produção) — Authorization Code + S256

> Fluxo real do frontend. Kong injeta `client_secret` em produção. Para testes manuais use o script abaixo.

```bash
# Endpoint authorize: GET http://localhost:8080/realms/domestic-backend/protocol/openid-connect/auth
# Endpoint token:     POST http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token

CLIENT_ID='domestic-backend-bff'
CLIENT_SECRET='backend-bff-client-secret'
REDIRECT_URI='http://localhost:3001/callback'

CODE_VERIFIER=$(openssl rand -base64 32 | tr -d '=\n' | tr '+/' '-_' | cut -c1-43)
CODE_CHALLENGE=$(printf '%s' "$CODE_VERIFIER" | openssl dgst -sha256 -binary | base64 | tr -d '=' | tr '+/' '-_')

echo "Abra no browser:"
echo "http://localhost:8080/realms/domestic-backend/protocol/openid-connect/auth?response_type=code&client_id=$CLIENT_ID&redirect_uri=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$REDIRECT_URI'))")&scope=openid&code_challenge=$CODE_CHALLENGE&code_challenge_method=S256"

echo "Cole o code da URL de redirect:"
read -r AUTH_CODE

TOKENS=$(curl -s -X POST \
  'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "grant_type=authorization_code" \
  -d "code=$AUTH_CODE" \
  -d "redirect_uri=$REDIRECT_URI" \
  -d "code_verifier=$CODE_VERIFIER" \
  -d "client_id=$CLIENT_ID" \
  -d "client_secret=$CLIENT_SECRET")

USER_TOKEN=$(echo "$TOKENS" | jq -r '.access_token')
REFRESH_TOKEN=$(echo "$TOKENS" | jq -r '.refresh_token')
```

---

## Passo 2 — Extrair Keycloak IDs (sub)

Três formas de obter o `sub` de cada usuário — use a que preferir.

### Opção A — Decodificar o JWT localmente (sem rede)

> Funciona com qualquer token já obtido no Passo 1. O `sub` está no payload (2ª parte do JWT).

```bash
# sub do contratante (contractor@domestic.local)
USER_KEYCLOAK_ID=$(echo "$USER_TOKEN" \
  | cut -d. -f2 \
  | base64 -d 2>/dev/null \
  | jq -r '.sub')

# sub do prestador (provider@domestic.local)
PROVIDER_KEYCLOAK_ID=$(echo "$PROVIDER_TOKEN" \
  | cut -d. -f2 \
  | base64 -d 2>/dev/null \
  | jq -r '.sub')

# sub do admin (admin@domestic.local)
ADMIN_KEYCLOAK_ID=$(echo "$ADMIN_TOKEN" \
  | cut -d. -f2 \
  | base64 -d 2>/dev/null \
  | jq -r '.sub')

echo "USER_KEYCLOAK_ID:     $USER_KEYCLOAK_ID"
echo "PROVIDER_KEYCLOAK_ID: $PROVIDER_KEYCLOAK_ID"
echo "ADMIN_KEYCLOAK_ID:    $ADMIN_KEYCLOAK_ID"
```

### Opção B — `/userinfo` endpoint (um por vez, precisa do token)

```bash
# sub do contratante
USER_KEYCLOAK_ID=$(curl -s \
  'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/userinfo' \
  -H "Authorization: Bearer $USER_TOKEN" | jq -r '.sub')

# sub do prestador
PROVIDER_KEYCLOAK_ID=$(curl -s \
  'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/userinfo' \
  -H "Authorization: Bearer $PROVIDER_TOKEN" | jq -r '.sub')

# sub do admin
ADMIN_KEYCLOAK_ID=$(curl -s \
  'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/userinfo' \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.sub')
```

### Opção C — Admin API (todos de uma vez, sem precisar dos tokens de usuário)

```bash
# 1. Token do realm master
# POST http://localhost:8080/realms/master/protocol/openid-connect/token
KEYCLOAK_ADMIN_TOKEN=$(curl -s -X POST \
  'http://localhost:8080/realms/master/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password' \
  -d 'client_id=admin-cli' \
  -d 'username=admin' \
  -d 'password=admin' | jq -r '.access_token')

# 2. Listar todos os usuários do realm domestic-backend
# GET http://localhost:8080/admin/realms/domestic-backend/users
USERS=$(curl -s \
  'http://localhost:8080/admin/realms/domestic-backend/users' \
  -H "Authorization: Bearer $KEYCLOAK_ADMIN_TOKEN")

# 3. Extrair sub de cada usuário pelo username
USER_KEYCLOAK_ID=$(echo "$USERS" \
  | jq -r '.[] | select(.username == "contractor-test") | .id')

PROVIDER_KEYCLOAK_ID=$(echo "$USERS" \
  | jq -r '.[] | select(.username == "provider-test") | .id')

ADMIN_KEYCLOAK_ID=$(echo "$USERS" \
  | jq -r '.[] | select(.username == "admin") | .id')

echo "USER_KEYCLOAK_ID:     $USER_KEYCLOAK_ID"
echo "PROVIDER_KEYCLOAK_ID: $PROVIDER_KEYCLOAK_ID"
echo "ADMIN_KEYCLOAK_ID:    $ADMIN_KEYCLOAK_ID"
```

---

## Passo 3 — Variáveis de referência

```bash
# Endpoints
BASE='http://localhost:3333/v1'
BASE_KONG='http://localhost:8000'
KEYCLOAK='http://localhost:8080/realms/domestic-backend/protocol/openid-connect'

# Tokens (preencher com o Passo 1)
SERVICE_TOKEN=''   # domestic-api — client_credentials
USER_TOKEN=''      # contractor@domestic.local — via domestic-backend-bff
PROVIDER_TOKEN=''  # provider@domestic.local   — via domestic-backend-bff
ADMIN_TOKEN=''     # admin@domestic.local       — via domestic-backend-bff
SUPPORT_TOKEN=''   # support@domestic.local     — via domestic-backend-bff

# IDs (preencher com o Passo 2 — opção A, B ou C)
USER_KEYCLOAK_ID=''       # sub do contractor@domestic.local
PROVIDER_KEYCLOAK_ID=''   # sub do provider@domestic.local
ADMIN_KEYCLOAK_ID=''      # sub do admin@domestic.local

USER_ID=''
PROVIDER_ID=''
CATEGORY_ID=''
SERVICE_ID=''
ADDRESS_ID=''
SERVICE_REQUEST_ID=''
REVIEW_ID=''
DOCUMENT_ID=''
NOTIFICATION_ID=''
```

---

## Modo de teste local (direto — sem Kong)

```bash
# Simula o que o Kong injetaria nos headers upstream para cada perfil
AUTH_CONTRACTOR="-H 'Authorization: Bearer $SERVICE_TOKEN' -H 'X-Access-Token: $USER_TOKEN'"
AUTH_PROVIDER="-H 'Authorization: Bearer $SERVICE_TOKEN' -H 'X-Access-Token: $PROVIDER_TOKEN'"
AUTH_ADMIN="-H 'Authorization: Bearer $SERVICE_TOKEN' -H 'X-Access-Token: $ADMIN_TOKEN'"
AUTH_SUPPORT="-H 'Authorization: Bearer $SERVICE_TOKEN' -H 'X-Access-Token: $SUPPORT_TOKEN'"
```

### Kong (porta 8000) — rotas expostas

| Método | Kong                                   | Upstream                                                                      |
| ------ | -------------------------------------- | ----------------------------------------------------------------------------- |
| `GET`  | `http://localhost:8000/auth/authorize` | `http://localhost:8080/realms/domestic-backend/protocol/openid-connect/auth`  |
| `POST` | `http://localhost:8000/auth/token`     | `http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token` |

> Kong injeta automaticamente `client_id=domestic-backend-bff` e `client_secret=backend-bff-client-secret`.

---

## Health

### GET `http://localhost:3333/health`

> Rota sem versionamento (`VERSION_NEUTRAL`). Excluída do `HttpLoggingInterceptor`.

```bash
curl -s http://localhost:3333/health | jq
```

**Resposta esperada — 200**

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

---

## Users

### POST `http://localhost:3333/v1/users` — Criar usuário (público)

```bash
curl -s -X POST 'http://localhost:3333/v1/users' \
  -H 'Content-Type: application/json' \
  -d '{
    "fullName": "João Silva",
    "keycloakId": "'$USER_KEYCLOAK_ID'"
  }' | jq
```

**Resposta esperada — 201**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "keycloakId": "877f4dec-89e4-465d-9325-b6598578fb79",
  "fullName": "João Silva",
  "status": "PENDING",
  "createdAt": "2026-04-09T10:00:00.000Z"
}
```

---

### GET `http://localhost:3333/v1/users/me` — Perfil do contratante autenticado

> `X-Access-Token`: token do **contratante** (`contractor@domestic.local`). O `sub` do JWT identifica o usuário.

```bash
curl -s 'http://localhost:3333/v1/users/me' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" | jq
```

**Erro — sem X-Access-Token — 401**

```json
{ "statusCode": 401, "message": "Missing X-Access-Token header." }
```

---

### GET `http://localhost:3333/v1/users/:id` — Buscar usuário por ID (público)

```bash
curl -s "http://localhost:3333/v1/users/$USER_ID" | jq
```

---

### PUT `http://localhost:3333/v1/users/:id` — Atualizar usuário

```bash
curl -s -X PUT "http://localhost:3333/v1/users/$USER_ID" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" \
  -d '{ "fullName": "João Atualizado" }' | jq
```

---

### DELETE `http://localhost:3333/v1/users/:id` — Deletar usuário (soft delete)

```bash
curl -s -X DELETE "http://localhost:3333/v1/users/$USER_ID" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" \
  -o /dev/null -w "%{http_code}\n"
```

**Resposta esperada — 204**

---

### POST `http://localhost:3333/v1/users/:id/restore` — Restaurar usuário deletado

> Reativa uma conta removida via soft delete. O `:id` é o **UUID interno** da tabela `users` (não o `keycloakId`).
>
> Obtenha o ID interno com:
>
> ```bash
> USER_DB_ID=$(curl -s 'http://localhost:3333/v1/users/me' -H "X-Access-Token: $USER_TOKEN" | jq -r '.id')
> ```

```bash
curl -s -X POST "http://localhost:3333/v1/users/$USER_DB_ID/restore" | jq
```

**Resposta esperada — 200**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "keycloakId": "38bc8bb0-df40-4603-8ccc-2486c5fba80e",
  "fullName": "João Silva",
  "status": "PENDING",
  "createdAt": "2026-04-09T10:00:00.000Z",
  "updatedAt": "2026-04-11T14:00:00.000Z",
  "deletedAt": null
}
```

**Erro — usuário não encontrado — 404**

```json
{
  "statusCode": 404,
  "message": "User not found",
  "code": "USER_NOT_FOUND",
  "type": "NOT_FOUND"
}
```

**Erro — usuário não está deletado — 422**

```json
{
  "statusCode": 422,
  "message": "User is not deleted and cannot be restored.",
  "code": "USER_NOT_DELETED",
  "type": "BUSINESS_LOGIC",
  "details": { "userId": "550e8400-e29b-41d4-a716-446655440001" }
}
```

**Fluxo completo delete → restore**

```bash
# 1. Obter ID interno
USER_DB_ID=$(curl -s 'http://localhost:3333/v1/users/me' -H "X-Access-Token: $USER_TOKEN" | jq -r '.id')

# 2. Deletar
curl -s -X DELETE "http://localhost:3333/v1/users/$USER_DB_ID" -o /dev/null -w "%{http_code}\n"

# 3. Confirmar que está deletado (409 ACCOUNT_DELETED)
curl -s "http://localhost:3333/v1/users/$USER_DB_ID" | jq '.code'

# 4. Restaurar
curl -s -X POST "http://localhost:3333/v1/users/$USER_DB_ID/restore" | jq
```

---

### GET `http://localhost:3333/v1/users/admin/stats` — Estatísticas (admin)

> `X-Access-Token`: token do **admin** (`admin@domestic.local`). Exige role `admin`.

```bash
curl -s 'http://localhost:3333/v1/users/admin/stats' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $ADMIN_TOKEN" | jq
```

**Resposta esperada — 200**

```json
{ "totalUsers": 42, "customers": 35, "providers": 7 }
```

---

### GET `http://localhost:3333/v1/users/me/addresses` — Listar endereços

> `X-Access-Token`: token do **contratante** (`contractor@domestic.local`).

```bash
curl -s 'http://localhost:3333/v1/users/me/addresses' $AUTH_CONTRACTOR | jq
```

**Resposta esperada — 200**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "street": "Rua das Flores",
    "number": "123",
    "complement": "Apto 4B",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01310-100",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "label": "Casa",
    "isPrimary": true,
    "createdAt": "2026-04-09T10:00:00.000Z"
  }
]
```

---

### POST `http://localhost:3333/v1/users/me/addresses` — Adicionar endereço

> `X-Access-Token`: token do **contratante** (`contractor@domestic.local`).

```bash
curl -s -X POST 'http://localhost:3333/v1/users/me/addresses' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" \
  -d '{
    "street": "Rua das Flores",
    "number": "123",
    "complement": "Apto 4B",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01310-100",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "label": "Casa",
    "isPrimary": true
  }' | jq
```

---

### DELETE `http://localhost:3333/v1/users/me/addresses/:addressId` — Remover endereço

> `X-Access-Token`: token do **contratante** (`contractor@domestic.local`).

```bash
curl -s -X DELETE "http://localhost:3333/v1/users/me/addresses/$ADDRESS_ID" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" \
  -o /dev/null -w "%{http_code}\n"
```

**Resposta esperada — 204**

---

## Categories

### GET `http://localhost:3333/v1/categories` — Listar categorias (público)

```bash
curl -s 'http://localhost:3333/v1/categories' | jq
```

---

### GET `http://localhost:3333/v1/categories/:id` — Buscar categoria (público)

```bash
curl -s "http://localhost:3333/v1/categories/$CATEGORY_ID" | jq
```

---

### POST `http://localhost:3333/v1/categories` — Criar categoria (admin)

> `X-Access-Token`: token do **admin** (`admin@domestic.local`). Exige role `service-manager`.

```bash
curl -s -X POST 'http://localhost:3333/v1/categories' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $ADMIN_TOKEN" \
  -d '{
    "name": "Jardinagem",
    "slug": "jardinagem",
    "iconUrl": "https://cdn.domestic.com/icons/garden.svg"
  }' | jq
```

---

### PUT `http://localhost:3333/v1/categories/:id` — Atualizar categoria (admin)

> `X-Access-Token`: token do **admin** (`admin@domestic.local`).

```bash
curl -s -X PUT "http://localhost:3333/v1/categories/$CATEGORY_ID" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $ADMIN_TOKEN" \
  -d '{ "name": "Limpeza Residencial" }' | jq
```

---

### DELETE `http://localhost:3333/v1/categories/:id` — Desativar categoria (admin)

> `X-Access-Token`: token do **admin** (`admin@domestic.local`).

```bash
curl -s -X DELETE "http://localhost:3333/v1/categories/$CATEGORY_ID" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $ADMIN_TOKEN" \
  -o /dev/null -w "%{http_code}\n"
```

---

## Services

### GET `http://localhost:3333/v1/services` — Listar serviços (público)

```bash
curl -s 'http://localhost:3333/v1/services' | jq
curl -s "http://localhost:3333/v1/services?categoryId=$CATEGORY_ID" | jq
```

---

### GET `http://localhost:3333/v1/services/:id` — Buscar serviço (público)

```bash
curl -s "http://localhost:3333/v1/services/$SERVICE_ID" | jq
```

---

### POST `http://localhost:3333/v1/services` — Criar serviço (admin)

> `X-Access-Token`: token do **admin** (`admin@domestic.local`). Exige role `service-manager`.

```bash
curl -s -X POST 'http://localhost:3333/v1/services' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $ADMIN_TOKEN" \
  -d '{
    "categoryId": "'$CATEGORY_ID'",
    "name": "Limpeza Completa",
    "description": "Limpeza completa do imóvel"
  }' | jq
```

---

### PUT `http://localhost:3333/v1/services/:id` — Atualizar serviço (admin)

> `X-Access-Token`: token do **admin** (`admin@domestic.local`).

```bash
curl -s -X PUT "http://localhost:3333/v1/services/$SERVICE_ID" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $ADMIN_TOKEN" \
  -d '{ "name": "Limpeza Completa Premium" }' | jq
```

---

## Providers

### POST `http://localhost:3333/v1/providers` — Criar perfil de prestador

> `X-Access-Token`: token do **prestador** (`provider@domestic.local`).

```bash
curl -s -X POST 'http://localhost:3333/v1/providers' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" \
  -d '{
    "userId": "'$USER_ID'",
    "businessName": "Limpeza Express",
    "description": "Serviços de limpeza residencial com 5 anos de experiência",
    "isAvailable": true
  }' | jq
```

---

### GET `http://localhost:3333/v1/providers` — Listar prestadores aprovados (público)

```bash
curl -s 'http://localhost:3333/v1/providers' | jq
```

---

### GET `http://localhost:3333/v1/providers/admin/pending` — Aguardando aprovação (admin)

> `X-Access-Token`: token do **admin** (`admin@domestic.local`). Exige role `admin`.

```bash
curl -s 'http://localhost:3333/v1/providers/admin/pending' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $ADMIN_TOKEN" | jq
```

---

### GET `http://localhost:3333/v1/providers/:id` — Buscar prestador (público)

```bash
curl -s "http://localhost:3333/v1/providers/$PROVIDER_ID" | jq
```

---

### PUT `http://localhost:3333/v1/providers/:id` — Atualizar perfil

> `X-Access-Token`: token do **prestador** (`provider@domestic.local`).

```bash
curl -s -X PUT "http://localhost:3333/v1/providers/$PROVIDER_ID" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" \
  -d '{ "description": "Serviços premium de limpeza", "isAvailable": false }' | jq
```

---

### POST `http://localhost:3333/v1/providers/:id/services` — Adicionar serviço ao prestador

> `X-Access-Token`: token do **prestador** (`provider@domestic.local`).

```bash
curl -s -X POST "http://localhost:3333/v1/providers/$PROVIDER_ID/services" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" \
  -d '{
    "serviceId": "'$SERVICE_ID'",
    "priceBase": 150.00,
    "priceType": "FIXED"
  }' | jq
```

---

### DELETE `http://localhost:3333/v1/providers/:id/services/:serviceId`

> `X-Access-Token`: token do **prestador** (`provider@domestic.local`).

```bash
curl -s -X DELETE "http://localhost:3333/v1/providers/$PROVIDER_ID/services/$SERVICE_ID" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" \
  -o /dev/null -w "%{http_code}\n"
```

---

### POST `http://localhost:3333/v1/providers/:id/work-locations` — Adicionar local de atendimento

> `X-Access-Token`: token do **prestador** (`provider@domestic.local`).

```bash
curl -s -X POST "http://localhost:3333/v1/providers/$PROVIDER_ID/work-locations" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" \
  -d '{
    "city": "São Paulo",
    "state": "SP",
    "neighborhood": "Pinheiros",
    "radiusKm": 10
  }' | jq
```

---

### POST `http://localhost:3333/v1/providers/:id/verification` — Submeter para verificação

> `X-Access-Token`: token do **prestador** (`provider@domestic.local`).

```bash
curl -s -X POST "http://localhost:3333/v1/providers/$PROVIDER_ID/verification" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" | jq
```

---

### GET `http://localhost:3333/v1/providers/:id/verification` — Status da verificação

> `X-Access-Token`: token do **prestador** (`provider@domestic.local`).

```bash
curl -s "http://localhost:3333/v1/providers/$PROVIDER_ID/verification" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" | jq
```

---

### PUT `http://localhost:3333/v1/providers/:id/verification/approve` — Aprovar prestador (admin)

> `X-Access-Token`: token do **admin** (`admin@domestic.local`). O `sub` do token é usado como `reviewedBy`.

```bash
curl -s -X PUT "http://localhost:3333/v1/providers/$PROVIDER_ID/verification/approve" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $ADMIN_TOKEN" | jq
```

---

### PUT `http://localhost:3333/v1/providers/:id/verification/reject` — Rejeitar prestador (admin)

> `X-Access-Token`: token do **admin** (`admin@domestic.local`). O `sub` do token é usado como `reviewedBy`.

```bash
curl -s -X PUT "http://localhost:3333/v1/providers/$PROVIDER_ID/verification/reject" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $ADMIN_TOKEN" \
  -d '{ "reason": "Documentação incompleta" }' | jq
```

---

## Service Requests

### POST `http://localhost:3333/v1/service-requests` — Criar solicitação (contratante)

> `X-Access-Token`: token do **contratante** (`contractor@domestic.local`).

```bash
curl -s -X POST 'http://localhost:3333/v1/service-requests' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" \
  -d '{
    "providerId": "'$PROVIDER_ID'",
    "serviceId": "'$SERVICE_ID'",
    "scheduledDate": "2026-04-15T14:00:00.000Z",
    "notes": "Apartamento de 2 quartos"
  }' | jq
```

---

### GET `http://localhost:3333/v1/service-requests` — Listar solicitações

```bash
# Como contratante (contractor@domestic.local)
curl -s 'http://localhost:3333/v1/service-requests' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" | jq

# Como prestador (provider@domestic.local)
curl -s 'http://localhost:3333/v1/service-requests' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" \
  -H "X-User-Type: PROVIDER" | jq
```

---

### GET `http://localhost:3333/v1/service-requests/:id` — Detalhe (público)

```bash
curl -s "http://localhost:3333/v1/service-requests/$SERVICE_REQUEST_ID" | jq
```

---

### PUT `http://localhost:3333/v1/service-requests/:id/accept` — Prestador aceita

> `X-Access-Token`: token do **prestador** (`provider@domestic.local`). Transição: `PENDING → ACCEPTED`.

```bash
curl -s -X PUT "http://localhost:3333/v1/service-requests/$SERVICE_REQUEST_ID/accept" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" | jq
```

---

### PUT `http://localhost:3333/v1/service-requests/:id/reject` — Prestador rejeita

> `X-Access-Token`: token do **prestador** (`provider@domestic.local`). Transição: `PENDING → REJECTED`.

```bash
curl -s -X PUT "http://localhost:3333/v1/service-requests/$SERVICE_REQUEST_ID/reject" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" | jq
```

---

### PUT `http://localhost:3333/v1/service-requests/:id/complete` — Contratante confirma conclusão

> `X-Access-Token`: token do **contratante** (`contractor@domestic.local`). Transição: `ACCEPTED → COMPLETED`.

```bash
curl -s -X PUT "http://localhost:3333/v1/service-requests/$SERVICE_REQUEST_ID/complete" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" | jq
```

---

### PUT `http://localhost:3333/v1/service-requests/:id/cancel` — Cancelar solicitação

> `X-Access-Token`: token do **contratante** (`contractor@domestic.local`).

```bash
curl -s -X PUT "http://localhost:3333/v1/service-requests/$SERVICE_REQUEST_ID/cancel" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" | jq
```

---

## Reviews

### POST `http://localhost:3333/v1/reviews` — Criar avaliação (contratante)

> `X-Access-Token`: token do **contratante** (`contractor@domestic.local`). Só após `COMPLETED`.

```bash
curl -s -X POST 'http://localhost:3333/v1/reviews' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" \
  -d '{
    "serviceRequestId": "'$SERVICE_REQUEST_ID'",
    "providerId": "'$PROVIDER_ID'",
    "rating": 5,
    "comment": "Excelente serviço, muito pontual!"
  }' | jq
```

---

### GET `http://localhost:3333/v1/reviews/provider/:providerId` — Listar avaliações (público)

```bash
curl -s "http://localhost:3333/v1/reviews/provider/$PROVIDER_ID" | jq
```

---

## Documents

### POST `http://localhost:3333/v1/documents` — Upload de documento (multipart)

> `X-Access-Token`: token do **prestador** (`provider@domestic.local`).

```bash
curl -s -X POST 'http://localhost:3333/v1/documents' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" \
  -F 'file=@/path/to/document.pdf' \
  -F 'documentType=CNH' | jq
```

---

### GET `http://localhost:3333/v1/documents/:id/url` — URL assinada (TTL 15min)

> `X-Access-Token`: token do **prestador** (`provider@domestic.local`) ou **suporte** (`support@domestic.local`).

```bash
curl -s "http://localhost:3333/v1/documents/$DOCUMENT_ID/url" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" | jq
```

---

### PUT `http://localhost:3333/v1/documents/:id/approve` — Aprovar documento (suporte/admin)

> `X-Access-Token`: token do **suporte** (`support@domestic.local`) ou **admin**. Exige role `document-verifier`.

```bash
curl -s -X PUT "http://localhost:3333/v1/documents/$DOCUMENT_ID/approve" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $SUPPORT_TOKEN" | jq
```

---

### PUT `http://localhost:3333/v1/documents/:id/reject` — Rejeitar documento (suporte/admin)

> `X-Access-Token`: token do **suporte** (`support@domestic.local`) ou **admin**. Exige role `document-verifier`.

```bash
curl -s -X PUT "http://localhost:3333/v1/documents/$DOCUMENT_ID/reject" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $SUPPORT_TOKEN" | jq
```

---

## Notifications

### GET `http://localhost:3333/v1/notifications` — Listar notificações

> `X-Access-Token`: token de qualquer usuário autenticado.

```bash
curl -s 'http://localhost:3333/v1/notifications' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" | jq
```

---

### PUT `http://localhost:3333/v1/notifications/:id/read` — Marcar como lida

> `X-Access-Token`: token do usuário dono da notificação.

```bash
curl -s -X PUT "http://localhost:3333/v1/notifications/$NOTIFICATION_ID/read" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" \
  -o /dev/null -w "%{http_code}\n"
```

**Resposta esperada — 204**

---

## Fluxo completo — ponta a ponta

```bash
#!/bin/bash
set -e

# ── Tokens ────────────────────────────────────────────────────────────────────
# Token do client domestic-api (B2B — Authorization header)
# POST http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token
SERVICE_TOKEN=$(curl -s -X POST \
  'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=client_credentials&client_id=domestic-api&client_secret=api-client-secret' \
  | jq -r '.access_token')

# Token do contratante contractor@domestic.local (B2C — X-Access-Token)
# POST http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token
USER_TOKEN=$(curl -s -X POST \
  'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password&client_id=domestic-backend-bff&client_secret=backend-bff-client-secret&username=contractor-test&password=ChangeMeSecurePassword123!' \
  | jq -r '.access_token')

# Token do prestador provider@domestic.local (B2C — X-Access-Token)
# POST http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token
PROVIDER_TOKEN=$(curl -s -X POST \
  'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password&client_id=domestic-backend-bff&client_secret=backend-bff-client-secret&username=provider-test&password=ChangeMeSecurePassword123!' \
  | jq -r '.access_token')

# Extrair keycloak_id (sub) dos tokens
USER_KEYCLOAK_ID=$(echo "$USER_TOKEN" | cut -d. -f2 | base64 -d 2>/dev/null | jq -r '.sub')
PROVIDER_KEYCLOAK_ID=$(echo "$PROVIDER_TOKEN" | cut -d. -f2 | base64 -d 2>/dev/null | jq -r '.sub')

echo "USER sub:     $USER_KEYCLOAK_ID"
echo "PROVIDER sub: $PROVIDER_KEYCLOAK_ID"

# ── Criar usuários ─────────────────────────────────────────────────────────────
# POST http://localhost:3333/v1/users
USER_ID=$(curl -s -X POST 'http://localhost:3333/v1/users' \
  -H 'Content-Type: application/json' \
  -d '{"fullName":"Contratante Teste","keycloakId":"'$USER_KEYCLOAK_ID'"}' | jq -r '.id')

PROVIDER_USER_ID=$(curl -s -X POST 'http://localhost:3333/v1/users' \
  -H 'Content-Type: application/json' \
  -d '{"fullName":"Prestador Teste","keycloakId":"'$PROVIDER_KEYCLOAK_ID'"}' | jq -r '.id')

# ── Categoria e serviço (admin) ────────────────────────────────────────────────
ADMIN_TOKEN=$(curl -s -X POST \
  'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password&client_id=domestic-backend-bff&client_secret=backend-bff-client-secret&username=admin&password=ChangeMeSecurePassword123!' \
  | jq -r '.access_token')

# POST http://localhost:3333/v1/categories
CATEGORY_ID=$(curl -s -X POST 'http://localhost:3333/v1/categories' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $ADMIN_TOKEN" \
  -d '{"name":"Limpeza","slug":"limpeza"}' | jq -r '.id')

# POST http://localhost:3333/v1/services
SERVICE_ID=$(curl -s -X POST 'http://localhost:3333/v1/services' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $ADMIN_TOKEN" \
  -d '{"categoryId":"'$CATEGORY_ID'","name":"Limpeza Completa","description":"Limpeza do imóvel"}' | jq -r '.id')

# ── Prestador ──────────────────────────────────────────────────────────────────
# POST http://localhost:3333/v1/providers
PROVIDER_ID=$(curl -s -X POST 'http://localhost:3333/v1/providers' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" \
  -d '{"userId":"'$PROVIDER_USER_ID'","businessName":"Limpeza Express","description":"5 anos de experiência","isAvailable":true}' | jq -r '.id')

# ── Solicitação ────────────────────────────────────────────────────────────────
# POST http://localhost:3333/v1/service-requests
SERVICE_REQUEST_ID=$(curl -s -X POST 'http://localhost:3333/v1/service-requests' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" \
  -d '{"providerId":"'$PROVIDER_ID'","serviceId":"'$SERVICE_ID'","scheduledDate":"2026-04-15T14:00:00.000Z"}' | jq -r '.id')

# PUT http://localhost:3333/v1/service-requests/:id/accept
curl -s -X PUT "http://localhost:3333/v1/service-requests/$SERVICE_REQUEST_ID/accept" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" | jq '.status'

# PUT http://localhost:3333/v1/service-requests/:id/complete
curl -s -X PUT "http://localhost:3333/v1/service-requests/$SERVICE_REQUEST_ID/complete" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" | jq '.status'

# ── Avaliação ──────────────────────────────────────────────────────────────────
# POST http://localhost:3333/v1/reviews
curl -s -X POST 'http://localhost:3333/v1/reviews' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" \
  -d '{"serviceRequestId":"'$SERVICE_REQUEST_ID'","providerId":"'$PROVIDER_ID'","rating":5,"comment":"Ótimo serviço!"}' | jq

echo "Fluxo completo!"
```

---

## Referência de erros comuns

| HTTP | Código                         | Causa                                      |
| ---- | ------------------------------ | ------------------------------------------ |
| 401  | `UNAUTHORIZED_MISSING_TOKEN`   | `X-Access-Token` ausente em rota protegida |
| 401  | `UNAUTHORIZED_INACTIVE_TOKEN`  | Token expirado ou inativo                  |
| 403  | `FORBIDDEN_INSUFFICIENT_ROLES` | Usuário sem a role necessária              |
| 404  | `USER_NOT_FOUND`               | Usuário não existe no banco                |
| 404  | `PROVIDER_NOT_FOUND`           | Prestador não encontrado                   |
| 409  | `DUPLICATE_KEYCLOAK_ID`        | Keycloak ID já cadastrado                  |
| 422  | —                              | DTO inválido (class-validator)             |
