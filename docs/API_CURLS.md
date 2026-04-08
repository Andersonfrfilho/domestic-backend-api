# API Curls — Domestic Backend

> **Base URL:** `http://localhost:3333` (direto) | `http://localhost:8000` (via Kong)
> **Versão:** todas as rotas respondem em `/v1/...` (NestJS URI versioning)

---

## Contrato de headers

| Header | Tipo | Quem injeta | Descrição |
|---|---|---|---|
| `Authorization` | `Bearer <service_token>` | Kong / serviço | Identidade do chamador (B2B). Kong usa seu próprio `client_credentials`. |
| `X-Access-Token` | `<user_jwt>` | Kong | Token original do usuário (B2C). Claims (`sub`, `email`, roles) decodificados localmente. |

> **Não existem mais `X-User-Id` nem `X-User-Roles`.**
> Todos os dados do usuário vêm do JWT em `X-Access-Token`.

---

## Passo 1 — Obter tokens para testes

### Token do usuário (B2C) — `password` grant

Use para simular o token que o frontend envia ao Kong.
Kong valida e injeta em `X-Access-Token`.

```bash
# contractor-test (roles: user-manager, manage-requests, manage-reviews, send-notifications)
USER_TOKEN=$(curl -s -X POST 'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password' \
  -d 'client_id=domestic-backend-bff' \
  -d 'client_secret=backend-bff-client-secret' \
  -d 'username=contractor@domestic.local' \
  -d 'password=ChangeMeSecurePassword123!' | jq -r '.access_token')

echo "USER_TOKEN: ${USER_TOKEN:0:50}..."
```

```bash
# provider-test (roles: user-manager, manage-requests, manage-services)
PROVIDER_TOKEN=$(curl -s -X POST 'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password' \
  -d 'client_id=domestic-backend-bff' \
  -d 'client_secret=backend-bff-client-secret' \
  -d 'username=provider@domestic.local' \
  -d 'password=ChangeMeSecurePassword123!' | jq -r '.access_token')

echo "PROVIDER_TOKEN: ${PROVIDER_TOKEN:0:50}..."
```

```bash
# admin (roles: user-manager, manage-services, manage-requests, manage-reviews, send-notifications)
ADMIN_TOKEN=$(curl -s -X POST 'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password' \
  -d 'client_id=domestic-backend-bff' \
  -d 'client_secret=backend-bff-client-secret' \
  -d 'username=admin@domestic.local' \
  -d 'password=ChangeMeSecurePassword123!' | jq -r '.access_token')

echo "ADMIN_TOKEN: ${ADMIN_TOKEN:0:50}..."
```

### Token do serviço (B2B) — `client_credentials` grant

Simula o token que o Kong ou o BFF envia em `Authorization`.

```bash
SERVICE_TOKEN=$(curl -s -X POST 'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=client_credentials' \
  -d 'client_id=domestic-backend-bff' \
  -d 'client_secret=backend-bff-client-secret' | jq -r '.access_token')

echo "SERVICE_TOKEN: ${SERVICE_TOKEN:0:50}..."
```

---

## Passo 2 — Variáveis de referência

```bash
BASE='http://localhost:3333/v1'

# Tokens (preencha após o Passo 1)
USER_TOKEN=''
PROVIDER_TOKEN=''
ADMIN_TOKEN=''
SERVICE_TOKEN=''

# IDs — substitua pelos reais após criar os recursos
USER_KEYCLOAK_ID=''        # sub do JWT do usuário (jq -r '.sub' <<< $(echo $USER_TOKEN | cut -d. -f2 | base64 -d 2>/dev/null))
PROVIDER_KEYCLOAK_ID=''
ADMIN_KEYCLOAK_ID=''
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

```bash
# Decodifica o payload do JWT e extrai o sub
echo $USER_TOKEN | cut -d. -f2 | base64 -d 2>/dev/null | jq -r '.sub'
```

---

## Modo de teste local (sem Kong)

Localmente você simula o que o Kong faria: envia `Authorization` com o service token e `X-Access-Token` com o user token.

```bash
# Atalhos para testes locais — simula Kong
AUTH_CONTRACTOR="-H 'Authorization: Bearer $SERVICE_TOKEN' -H 'X-Access-Token: $USER_TOKEN'"
AUTH_PROVIDER="-H 'Authorization: Bearer $SERVICE_TOKEN' -H 'X-Access-Token: $PROVIDER_TOKEN'"
AUTH_ADMIN="-H 'Authorization: Bearer $SERVICE_TOKEN' -H 'X-Access-Token: $ADMIN_TOKEN'"
```

Via Kong (porta 8000) você envia só o token do usuário — Kong faz o resto:

```bash
# Via Kong — envia só o Bearer do usuário
curl -s "$BASE_KONG/v1/users/me" \
  -H "Authorization: Bearer $USER_TOKEN" | jq
```

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

| HTTP | Código | Causa |
|---|---|---|
| 401 | `UNAUTHORIZED_MISSING_TOKEN` | `X-Access-Token` ausente em rota protegida |
| 401 | `UNAUTHORIZED_INACTIVE_TOKEN` | Token expirado ou inativo |
| 403 | `FORBIDDEN_INSUFFICIENT_ROLES` | Usuário sem a role necessária |
| 404 | `USER_NOT_FOUND` | Usuário não existe no banco |
| 404 | `PROVIDER_NOT_FOUND` | Prestador não encontrado |
| 409 | `DUPLICATE_KEYCLOAK_ID` | Keycloak ID já cadastrado |
| 422 | — | DTO inválido (class-validator) |
