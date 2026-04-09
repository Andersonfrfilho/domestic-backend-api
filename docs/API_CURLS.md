# API Curls — Domestic Backend

> **Base URL:** `http://localhost:3333` (direto) | `http://localhost:8000` (via Kong)
> **Versão:** todas as rotas respondem em `/v1/...` (NestJS URI versioning)

---

## Contrato de headers

| Header           | Tipo                     | Quem injeta    | Descrição                                                                                 |
| ---------------- | ------------------------ | -------------- | ----------------------------------------------------------------------------------------- |
| `Authorization`  | `Bearer <service_token>` | Kong / serviço | Identidade do chamador (B2B). Kong usa seu próprio `client_credentials`.                  |
| `X-Access-Token` | `<user_jwt>`             | Kong           | Token original do usuário (B2C). Claims (`sub`, `email`, roles) decodificados localmente. |

> **Não existem mais `X-User-Id` nem `X-User-Roles`.**
> Todos os dados do usuário vêm do JWT em `X-Access-Token`.

---

## Passo 1 — Obter tokens para testes

### Fluxo B2C — Authorization Code + PKCE (S256)

> Este é o fluxo de produção. O frontend nunca vê o `client_secret` — Kong injeta server-side.

```
Frontend                Kong                  Keycloak
   │                      │                      │
   │ GET /auth/authorize   │                      │
   │ ?code_challenge=...   │                      │
   │──────────────────────>│ GET /realms/.../auth │
   │                       │ ?client_id=bff&...   │
   │                       │─────────────────────>│
   │<──────────────────────────────────────────────│ redirect → login page
   │ (usuário loga no Keycloak)                    │
   │<──────────────────────────────────────────────│ redirect → callback?code=AUTH_CODE
   │                      │                        │
   │ POST /auth/token      │                        │
   │ { code, code_verifier │                        │
   │   redirect_uri }      │                        │
   │──────────────────────>│ POST /realms/.../token │
   │                       │ + client_secret (Kong) │
   │                       │────────────────────────>
   │<──────────────────────│ { access_token, refresh_token }
```

#### Script de teste PKCE via curl

```bash
KEYCLOAK='http://localhost:8080/realms/domestic-backend/protocol/openid-connect'
CLIENT_ID='domestic-backend-bff'
CLIENT_SECRET='backend-bff-client-secret'
REDIRECT_URI='http://localhost:3001/callback'

# 1. Gerar code_verifier (43 chars, URL-safe base64)
CODE_VERIFIER=$(openssl rand -base64 32 | tr -d '=\n' | tr '+/' '-_' | cut -c1-43)

# 2. Gerar code_challenge = BASE64URL(SHA256(code_verifier))
CODE_CHALLENGE=$(printf '%s' "$CODE_VERIFIER" | openssl dgst -sha256 -binary | base64 | tr -d '=' | tr '+/' '-_')

echo "code_verifier:  $CODE_VERIFIER"
echo "code_challenge: $CODE_CHALLENGE"

# 3. Abrir no browser (ou curl com -L para seguir redirects)
echo ""
echo "Abra no browser e logue:"
echo "$KEYCLOAK/auth?response_type=code&client_id=$CLIENT_ID&redirect_uri=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$REDIRECT_URI'))")&scope=openid&code_challenge=$CODE_CHALLENGE&code_challenge_method=S256"
echo ""
echo "Após login, copie o 'code' da URL de redirect e cole abaixo:"
read -r AUTH_CODE

# 4. Trocar code por tokens (Kong injeta client_secret em produção; aqui chamamos direto)
TOKENS=$(curl -s -X POST "$KEYCLOAK/token" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "grant_type=authorization_code" \
  -d "code=$AUTH_CODE" \
  -d "redirect_uri=$REDIRECT_URI" \
  -d "code_verifier=$CODE_VERIFIER" \
  -d "client_id=$CLIENT_ID" \
  -d "client_secret=$CLIENT_SECRET")

USER_TOKEN=$(echo "$TOKENS" | jq -r '.access_token')
REFRESH_TOKEN=$(echo "$TOKENS" | jq -r '.refresh_token')

echo "USER_TOKEN:    ${USER_TOKEN:0:60}..."
echo "REFRESH_TOKEN: ${REFRESH_TOKEN:0:60}..."
```

#### Renovar token (refresh)

```bash
NEW_TOKENS=$(curl -s -X POST "$KEYCLOAK/token" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "grant_type=refresh_token" \
  -d "refresh_token=$REFRESH_TOKEN" \
  -d "client_id=$CLIENT_ID" \
  -d "client_secret=$CLIENT_SECRET")

USER_TOKEN=$(echo "$NEW_TOKENS" | jq -r '.access_token')
echo "USER_TOKEN renovado: ${USER_TOKEN:0:60}..."
```

### Token do serviço (B2B) — `client_credentials` grant

Kong usa internamente. Para testes manuais:

```bash
SERVICE_TOKEN=$(curl -s -X POST 'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=client_credentials' \
  -d 'client_id=domestic-backend-bff' \
  -d 'client_secret=backend-bff-client-secret' | jq -r '.access_token')

echo "SERVICE_TOKEN: ${SERVICE_TOKEN:0:60}..."
```

---

## Passo 2 — Variáveis de referência

> Execute o script PKCE do Passo 1 **uma vez por usuário** trocando as credenciais (`username`/`password`) para obter cada token.

```bash
BASE='http://localhost:3333/v1'
BASE_KONG='http://localhost:8000'

# Tokens B2C — obtidos via PKCE (Passo 1, um fluxo por usuário)
USER_TOKEN=''       # contractor@domestic.local
PROVIDER_TOKEN=''   # provider@domestic.local
ADMIN_TOKEN=''      # admin@domestic.local

# Token B2B — client_credentials (Passo 1, seção SERVICE_TOKEN)
SERVICE_TOKEN=''

# Keycloak subs (fixos neste ambiente local — gerados no import do realm)
USER_KEYCLOAK_ID='877f4dec-89e4-465d-9325-b6598578fb79'      # contractor@domestic.local
PROVIDER_KEYCLOAK_ID='58d2d94b-7a0c-4ac9-8edc-3c76df66765d'  # provider@domestic.local
ADMIN_KEYCLOAK_ID='e27c7a73-ea17-437b-870c-ca74087fa8f1'      # admin@domestic.local

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

### Extrair o `sub` (keycloak_id) de um token

#### Opção B — Keycloak Admin API (lista todos os usuários com sub)

```bash
# 1. Obter token de admin do realm master
KEYCLOAK_ADMIN_TOKEN=$(curl -s -X POST \
  'http://localhost:8080/realms/master/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password' \
  -d 'client_id=admin-cli' \
  -d 'username=admin' \
  -d 'password=admin' | jq -r '.access_token')

# 2. Listar usuários do realm e ver sub (= id no Keycloak)
curl -s 'http://localhost:8080/admin/realms/domestic-backend/users' \
  -H "Authorization: Bearer $KEYCLOAK_ADMIN_TOKEN" \
  | jq '[.[] | {id, username, email}]'
```

#### Opção C — `/userinfo` endpoint (token válido, sem admin)

```bash
# Retorna sub + perfil do usuário dono do token
curl -s 'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/userinfo' \
  -H "Authorization: Bearer $USER_TOKEN" | jq '{sub, email, preferred_username}'
```

---

## Modo de teste local (direto no backend — sem Kong, sem BFF)

Simula o que o Kong/BFF faria: envia `Authorization` com o service token e `X-Access-Token` com o user token diretamente na porta 3333.

```bash
# Atalhos — simula o que Kong injetaria nos headers upstream
AUTH_CONTRACTOR="-H 'Authorization: Bearer $SERVICE_TOKEN' -H 'X-Access-Token: $USER_TOKEN'"
AUTH_PROVIDER="-H 'Authorization: Bearer $SERVICE_TOKEN' -H 'X-Access-Token: $PROVIDER_TOKEN'"
AUTH_ADMIN="-H 'Authorization: Bearer $SERVICE_TOKEN' -H 'X-Access-Token: $ADMIN_TOKEN'"
```

> **Via Kong (porta 8000):** apenas as rotas `/auth/authorize` e `/auth/token` estão expostas enquanto o BFF não sobe. Todas as rotas de negócio são testadas diretamente em `http://localhost:3333`.

---

## Health

### GET /health

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

### POST /v1/users — Criar usuário (público)

```bash
curl -s -X POST "$BASE/users" \
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
  "keycloakId": "11111111-1111-4111-8111-111111111111",
  "fullName": "João Silva",
  "status": "PENDING",
  "createdAt": "2026-04-08T10:00:00.000Z"
}
```

---

### GET /v1/users/me — Perfil do usuário autenticado

```bash
curl -s "$BASE/users/me" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" | jq
```

**Resposta esperada — 200**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "keycloakId": "11111111-1111-4111-8111-111111111111",
  "fullName": "João Silva",
  "status": "ACTIVE"
}
```

**Erro — sem X-Access-Token — 401**

```json
{ "statusCode": 401, "message": "Missing X-Access-Token header." }
```

---

### GET /v1/users/:id — Buscar usuário por ID (público)

```bash
curl -s "$BASE/users/$USER_ID" | jq
```

---

### PUT /v1/users/:id — Atualizar usuário

```bash
curl -s -X PUT "$BASE/users/$USER_ID" \
  -H 'Content-Type: application/json' \
  -d '{ "fullName": "João Atualizado" }' | jq
```

---

### DELETE /v1/users/:id — Deletar usuário (soft delete)

```bash
curl -s -X DELETE "$BASE/users/$USER_ID" -o /dev/null -w "%{http_code}\n"
```

**Resposta esperada — 204**

---

### GET /v1/users/admin/stats

```bash
curl -s "$BASE/users/admin/stats" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $ADMIN_TOKEN" | jq
```

**Resposta esperada — 200**

```json
{ "totalUsers": 42, "customers": 35, "providers": 7 }
```

---

### GET /v1/users/me/addresses — Listar endereços

```bash
curl -s "$BASE/users/me/addresses" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" | jq
```

---

### POST /v1/users/me/addresses — Adicionar endereço

```bash
curl -s -X POST "$BASE/users/me/addresses" \
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

### DELETE /v1/users/me/addresses/:addressId — Remover endereço

```bash
curl -s -X DELETE "$BASE/users/me/addresses/$ADDRESS_ID" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" \
  -o /dev/null -w "%{http_code}\n"
```

**Resposta esperada — 204**

---

## Categories

### GET /v1/categories — Listar categorias (público)

```bash
curl -s "$BASE/categories" | jq
```

---

### GET /v1/categories/:id — Buscar categoria (público)

```bash
curl -s "$BASE/categories/$CATEGORY_ID" | jq
```

---

### POST /v1/categories — Criar categoria (admin)

```bash
curl -s -X POST "$BASE/categories" \
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

### PUT /v1/categories/:id — Atualizar categoria (admin)

```bash
curl -s -X PUT "$BASE/categories/$CATEGORY_ID" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $ADMIN_TOKEN" \
  -d '{ "name": "Limpeza Residencial" }' | jq
```

---

### DELETE /v1/categories/:id — Desativar categoria (admin)

```bash
curl -s -X DELETE "$BASE/categories/$CATEGORY_ID" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $ADMIN_TOKEN" \
  -o /dev/null -w "%{http_code}\n"
```

---

## Services

### GET /v1/services — Listar serviços (público)

```bash
curl -s "$BASE/services" | jq
curl -s "$BASE/services?categoryId=$CATEGORY_ID" | jq
```

---

### GET /v1/services/:id — Buscar serviço (público)

```bash
curl -s "$BASE/services/$SERVICE_ID" | jq
```

---

### POST /v1/services — Criar serviço (admin)

```bash
curl -s -X POST "$BASE/services" \
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

### PUT /v1/services/:id — Atualizar serviço (admin)

```bash
curl -s -X PUT "$BASE/services/$SERVICE_ID" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $ADMIN_TOKEN" \
  -d '{ "name": "Limpeza Completa Premium" }' | jq
```

---

## Providers

### POST /v1/providers — Criar perfil de prestador

```bash
curl -s -X POST "$BASE/providers" \
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

### GET /v1/providers — Listar prestadores aprovados (público)

```bash
curl -s "$BASE/providers" | jq
```

---

### GET /v1/providers/admin/pending — Listar aguardando aprovação (admin)

```bash
curl -s "$BASE/providers/admin/pending" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $ADMIN_TOKEN" | jq
```

---

### GET /v1/providers/:id — Buscar prestador (público)

```bash
curl -s "$BASE/providers/$PROVIDER_ID" | jq
```

---

### PUT /v1/providers/:id — Atualizar perfil

```bash
curl -s -X PUT "$BASE/providers/$PROVIDER_ID" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" \
  -d '{ "description": "Serviços premium de limpeza", "isAvailable": false }' | jq
```

---

### POST /v1/providers/:id/services — Adicionar serviço ao prestador

```bash
curl -s -X POST "$BASE/providers/$PROVIDER_ID/services" \
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

### DELETE /v1/providers/:id/services/:serviceId

```bash
curl -s -X DELETE "$BASE/providers/$PROVIDER_ID/services/$SERVICE_ID" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" \
  -o /dev/null -w "%{http_code}\n"
```

---

### POST /v1/providers/:id/work-locations — Adicionar local de atendimento

```bash
curl -s -X POST "$BASE/providers/$PROVIDER_ID/work-locations" \
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

### POST /v1/providers/:id/verification — Submeter para verificação

```bash
curl -s -X POST "$BASE/providers/$PROVIDER_ID/verification" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" | jq
```

---

### GET /v1/providers/:id/verification — Status da verificação

```bash
curl -s "$BASE/providers/$PROVIDER_ID/verification" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" | jq
```

---

### PUT /v1/providers/:id/verification/approve — Aprovar prestador (admin)

```bash
curl -s -X PUT "$BASE/providers/$PROVIDER_ID/verification/approve" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $ADMIN_TOKEN" | jq
```

> `@AuthUser()` extrai o `sub` do `ADMIN_TOKEN` como `reviewedBy`.

---

### PUT /v1/providers/:id/verification/reject — Rejeitar prestador (admin)

```bash
curl -s -X PUT "$BASE/providers/$PROVIDER_ID/verification/reject" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $ADMIN_TOKEN" \
  -d '{ "reason": "Documentação incompleta" }' | jq
```

---

## Service Requests

### POST /v1/service-requests — Criar solicitação (CUSTOMER)

```bash
curl -s -X POST "$BASE/service-requests" \
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

### GET /v1/service-requests — Listar solicitações

```bash
# Como contratante (CUSTOMER)
curl -s "$BASE/service-requests" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" | jq

# Como prestador (PROVIDER) — passa X-User-Type
curl -s "$BASE/service-requests" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" \
  -H "X-User-Type: PROVIDER" | jq
```

---

### GET /v1/service-requests/:id — Detalhe da solicitação (público)

```bash
curl -s "$BASE/service-requests/$SERVICE_REQUEST_ID" | jq
```

---

### PUT /v1/service-requests/:id/accept — Prestador aceita (PENDING → ACCEPTED)

```bash
curl -s -X PUT "$BASE/service-requests/$SERVICE_REQUEST_ID/accept" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" | jq
```

---

### PUT /v1/service-requests/:id/reject — Prestador rejeita (PENDING → REJECTED)

```bash
curl -s -X PUT "$BASE/service-requests/$SERVICE_REQUEST_ID/reject" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" | jq
```

---

### PUT /v1/service-requests/:id/complete — Contratante confirma conclusão (ACCEPTED → COMPLETED)

```bash
curl -s -X PUT "$BASE/service-requests/$SERVICE_REQUEST_ID/complete" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" | jq
```

---

### PUT /v1/service-requests/:id/cancel — Cancelar solicitação

```bash
curl -s -X PUT "$BASE/service-requests/$SERVICE_REQUEST_ID/cancel" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" | jq
```

---

## Reviews

### POST /v1/reviews — Criar avaliação (CUSTOMER)

```bash
curl -s -X POST "$BASE/reviews" \
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

### GET /v1/reviews/provider/:providerId — Listar avaliações do prestador (público)

```bash
curl -s "$BASE/reviews/provider/$PROVIDER_ID" | jq
```

---

## Documents

### POST /v1/documents — Upload de documento (multipart)

```bash
curl -s -X POST "$BASE/documents" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" \
  -F 'file=@/path/to/document.pdf' \
  -F 'documentType=CNH' | jq
```

---

### GET /v1/documents/:id/url — Obter URL assinada (TTL 15min)

```bash
curl -s "$BASE/documents/$DOCUMENT_ID/url" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" | jq
```

---

### PUT /v1/documents/:id/approve — Aprovar documento (admin)

```bash
curl -s -X PUT "$BASE/documents/$DOCUMENT_ID/approve" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $ADMIN_TOKEN" | jq
```

---

### PUT /v1/documents/:id/reject — Rejeitar documento (admin)

```bash
curl -s -X PUT "$BASE/documents/$DOCUMENT_ID/reject" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $ADMIN_TOKEN" | jq
```

---

## Notifications

### GET /v1/notifications — Listar notificações do usuário

```bash
curl -s "$BASE/notifications" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" | jq
```

---

### PUT /v1/notifications/:id/read — Marcar como lida

```bash
curl -s -X PUT "$BASE/notifications/$NOTIFICATION_ID/read" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" \
  -o /dev/null -w "%{http_code}\n"
```

**Resposta esperada — 204**

---

## Fluxo completo — exemplo ponta a ponta

```bash
#!/bin/bash
BASE='http://localhost:3333/v1'

# 1. Obter tokens
SERVICE_TOKEN=$(curl -s -X POST 'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=client_credentials&client_id=domestic-backend-bff&client_secret=backend-bff-client-secret' | jq -r '.access_token')

USER_TOKEN=$(curl -s -X POST 'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password&client_id=domestic-backend-bff&client_secret=backend-bff-client-secret&username=contractor@domestic.local&password=ChangeMeSecurePassword123!' | jq -r '.access_token')

PROVIDER_TOKEN=$(curl -s -X POST 'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password&client_id=domestic-backend-bff&client_secret=backend-bff-client-secret&username=provider@domestic.local&password=ChangeMeSecurePassword123!' | jq -r '.access_token')

USER_KEYCLOAK_ID=$(echo $USER_TOKEN | cut -d. -f2 | base64 -d 2>/dev/null | jq -r '.sub')
PROVIDER_KEYCLOAK_ID=$(echo $PROVIDER_TOKEN | cut -d. -f2 | base64 -d 2>/dev/null | jq -r '.sub')

echo "USER sub:     $USER_KEYCLOAK_ID"
echo "PROVIDER sub: $PROVIDER_KEYCLOAK_ID"

# 2. Criar usuários
USER_ID=$(curl -s -X POST "$BASE/users" \
  -H 'Content-Type: application/json' \
  -d '{"fullName":"Contratante Teste","keycloakId":"'$USER_KEYCLOAK_ID'"}' | jq -r '.id')

PROVIDER_USER_ID=$(curl -s -X POST "$BASE/users" \
  -H 'Content-Type: application/json' \
  -d '{"fullName":"Prestador Teste","keycloakId":"'$PROVIDER_KEYCLOAK_ID'"}' | jq -r '.id')

# 3. Criar categoria e serviço
CATEGORY_ID=$(curl -s -X POST "$BASE/categories" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" \
  -d '{"name":"Limpeza","slug":"limpeza"}' | jq -r '.id')

SERVICE_ID=$(curl -s -X POST "$BASE/services" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" \
  -d '{"categoryId":"'$CATEGORY_ID'","name":"Limpeza Completa","description":"Limpeza do imóvel"}' | jq -r '.id')

# 4. Criar perfil de prestador
PROVIDER_ID=$(curl -s -X POST "$BASE/providers" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" \
  -d '{"userId":"'$PROVIDER_USER_ID'","businessName":"Limpeza Express","description":"5 anos de experiência","isAvailable":true}' | jq -r '.id')

# 5. Criar solicitação de serviço
SERVICE_REQUEST_ID=$(curl -s -X POST "$BASE/service-requests" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" \
  -d '{"providerId":"'$PROVIDER_ID'","serviceId":"'$SERVICE_ID'","scheduledDate":"2026-04-15T14:00:00.000Z"}' | jq -r '.id')

# 6. Prestador aceita
curl -s -X PUT "$BASE/service-requests/$SERVICE_REQUEST_ID/accept" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $PROVIDER_TOKEN" | jq '.status'

# 7. Contratante confirma conclusão
curl -s -X PUT "$BASE/service-requests/$SERVICE_REQUEST_ID/complete" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "X-Access-Token: $USER_TOKEN" | jq '.status'

# 8. Contratante avalia
curl -s -X POST "$BASE/reviews" \
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
