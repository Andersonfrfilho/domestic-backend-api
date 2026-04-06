# API Curls — Zolve Backend

> **Base URL:** `http://localhost:3333`  
> **Versão:** todas as rotas respondem em `/v1/...` (NestJS URI versioning, `defaultVersion: '1'`)  
> **Auth:** Kong injeta `X-User-Id` (keycloak_id do usuário autenticado). Nos curls abaixo, substitua os valores entre `< >`.

---

## Variáveis de referência

```bash
BASE="http://localhost:3333/v1"

# IDs de exemplo — substitua pelos reais após criar os recursos
USER_ID="550e8400-e29b-41d4-a716-446655440001"
KEYCLOAK_ID="auth0|abc123def456"
PROVIDER_ID="550e8400-e29b-41d4-a716-446655440002"
CATEGORY_ID="550e8400-e29b-41d4-a716-446655440003"
SERVICE_ID="550e8400-e29b-41d4-a716-446655440004"
ADDRESS_ID="550e8400-e29b-41d4-a716-446655440005"
SERVICE_REQUEST_ID="550e8400-e29b-41d4-a716-446655440006"
REVIEW_ID="550e8400-e29b-41d4-a716-446655440007"
DOCUMENT_ID="550e8400-e29b-41d4-a716-446655440008"
NOTIFICATION_ID="550e8400-e29b-41d4-a716-446655440009"
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
  },
  "error": {},
  "details": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

---

## Users

### POST /v1/users — Criar usuário

```bash
curl -s -X POST "$BASE/users" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "João Silva",
    "keycloakId": "auth0|abc123def456"
  }' | jq
```

**Resposta esperada — 201**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "keycloakId": "auth0|abc123def456",
  "fullName": "João Silva",
  "status": "PENDING",
  "createdAt": "2026-04-05T22:00:00.000Z"
}
```

**Erro — keycloakId duplicado — 409**
```json
{
  "statusCode": 409,
  "code": "DUPLICATE_KEYCLOAK_ID",
  "message": "A keycloak ID already exists."
}
```

---

### GET /v1/users/me — Perfil do usuário autenticado

```bash
curl -s "$BASE/users/me" \
  -H "X-User-Id: $KEYCLOAK_ID" | jq
```

**Resposta esperada — 200**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "keycloakId": "auth0|abc123def456",
  "fullName": "João Silva",
  "status": "ACTIVE",
  "createdAt": "2026-04-05T22:00:00.000Z"
}
```

**Erro — usuário não encontrado — 404**
```json
{
  "statusCode": 404,
  "code": "USER_NOT_FOUND",
  "message": "User not found."
}
```

---

### GET /v1/users/:id — Buscar usuário por ID

```bash
curl -s "$BASE/users/$USER_ID" | jq
```

**Resposta esperada — 200**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "keycloakId": "auth0|abc123def456",
  "fullName": "João Silva",
  "status": "ACTIVE",
  "createdAt": "2026-04-05T22:00:00.000Z"
}
```

---

### PUT /v1/users/:id — Atualizar usuário

```bash
curl -s -X PUT "$BASE/users/$USER_ID" \
  -H "Content-Type: application/json" \
  -d '{ "fullName": "João Atualizado" }' | jq
```

**Resposta esperada — 200**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "keycloakId": "auth0|abc123def456",
  "fullName": "João Atualizado",
  "status": "ACTIVE",
  "createdAt": "2026-04-05T22:00:00.000Z"
}
```

---

### DELETE /v1/users/:id — Deletar usuário

```bash
curl -s -X DELETE "$BASE/users/$USER_ID" -o /dev/null -w "%{http_code}\n"
```

**Resposta esperada — 204** *(sem body)*

---

### GET /v1/users/admin/stats — Estatísticas (admin)

```bash
curl -s "$BASE/users/admin/stats" \
  -H "X-User-Id: $KEYCLOAK_ID" | jq
```

**Resposta esperada — 200**
```json
{
  "totalUsers": 42,
  "customers": 35,
  "providers": 7
}
```

---

### GET /v1/users/me/addresses — Listar endereços do usuário

```bash
curl -s "$BASE/users/me/addresses" \
  -H "X-User-Id: $KEYCLOAK_ID" | jq
```

**Resposta esperada — 200**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440005",
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
  }
]
```

---

### POST /v1/users/me/addresses — Adicionar endereço

```bash
curl -s -X POST "$BASE/users/me/addresses" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: $KEYCLOAK_ID" \
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

**Resposta esperada — 201**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
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
}
```

---

### DELETE /v1/users/me/addresses/:addressId — Remover endereço

```bash
curl -s -X DELETE "$BASE/users/me/addresses/$ADDRESS_ID" \
  -H "X-User-Id: $KEYCLOAK_ID" \
  -o /dev/null -w "%{http_code}\n"
```

**Resposta esperada — 204** *(sem body)*

---

## Categories

### GET /v1/categories — Listar categorias

```bash
curl -s "$BASE/categories" | jq
```

**Resposta esperada — 200**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "name": "Limpeza",
    "slug": "limpeza",
    "iconUrl": "https://cdn.zolve.com/icons/cleaning.svg",
    "isActive": true
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "name": "Elétrica",
    "slug": "eletrica",
    "iconUrl": null,
    "isActive": true
  }
]
```

---

### GET /v1/categories/:id — Buscar categoria por ID

```bash
curl -s "$BASE/categories/$CATEGORY_ID" | jq
```

**Resposta esperada — 200**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "name": "Limpeza",
  "slug": "limpeza",
  "iconUrl": "https://cdn.zolve.com/icons/cleaning.svg",
  "isActive": true
}
```

**Erro — não encontrada — 404**
```json
{
  "statusCode": 404,
  "code": "CATEGORY_NOT_FOUND",
  "message": "Category not found."
}
```

---

### POST /v1/categories — Criar categoria (admin)

```bash
curl -s -X POST "$BASE/categories" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: $KEYCLOAK_ID" \
  -d '{
    "name": "Jardinagem",
    "slug": "jardinagem",
    "iconUrl": "https://cdn.zolve.com/icons/garden.svg"
  }' | jq
```

**Resposta esperada — 201**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440011",
  "name": "Jardinagem",
  "slug": "jardinagem",
  "iconUrl": "https://cdn.zolve.com/icons/garden.svg",
  "isActive": true
}
```

**Erro — slug duplicado — 409**
```json
{
  "statusCode": 409,
  "code": "CATEGORY_DUPLICATE_SLUG",
  "message": "A category with this slug already exists."
}
```

---

### PUT /v1/categories/:id — Atualizar categoria (admin)

```bash
curl -s -X PUT "$BASE/categories/$CATEGORY_ID" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: $KEYCLOAK_ID" \
  -d '{
    "name": "Limpeza Residencial",
    "iconUrl": "https://cdn.zolve.com/icons/cleaning-v2.svg"
  }' | jq
```

**Resposta esperada — 200**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "name": "Limpeza Residencial",
  "slug": "limpeza",
  "iconUrl": "https://cdn.zolve.com/icons/cleaning-v2.svg",
  "isActive": true
}
```

---

### DELETE /v1/categories/:id — Desativar categoria (admin)

```bash
curl -s -X DELETE "$BASE/categories/$CATEGORY_ID" \
  -H "X-User-Id: $KEYCLOAK_ID" \
  -o /dev/null -w "%{http_code}\n"
```

**Resposta esperada — 204** *(sem body)*

---

## Services

### GET /v1/services — Listar serviços

```bash
# Todos os serviços
curl -s "$BASE/services" | jq

# Filtrar por categoria
curl -s "$BASE/services?categoryId=$CATEGORY_ID" | jq
```

**Resposta esperada — 200**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "categoryId": "550e8400-e29b-41d4-a716-446655440003",
    "name": "Limpeza Completa",
    "description": "Limpeza completa do imóvel incluindo todos os cômodos",
    "category": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "Limpeza",
      "slug": "limpeza"
    }
  }
]
```

---

### GET /v1/services/:id — Buscar serviço por ID

```bash
curl -s "$BASE/services/$SERVICE_ID" | jq
```

**Resposta esperada — 200**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "categoryId": "550e8400-e29b-41d4-a716-446655440003",
  "name": "Limpeza Completa",
  "description": "Limpeza completa do imóvel incluindo todos os cômodos",
  "category": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "name": "Limpeza",
    "slug": "limpeza"
  }
}
```

---

### POST /v1/services — Criar serviço (admin)

```bash
curl -s -X POST "$BASE/services" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: $KEYCLOAK_ID" \
  -d '{
    "categoryId": "550e8400-e29b-41d4-a716-446655440003",
    "name": "Limpeza de Vidros",
    "description": "Limpeza externa e interna de vidros e janelas"
  }' | jq
```

**Resposta esperada — 201**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440012",
  "categoryId": "550e8400-e29b-41d4-a716-446655440003",
  "name": "Limpeza de Vidros",
  "description": "Limpeza externa e interna de vidros e janelas"
}
```

**Erro — categoria não encontrada — 404**
```json
{
  "statusCode": 404,
  "code": "SERVICE_CATEGORY_NOT_FOUND",
  "message": "Category not found for this service."
}
```

---

### PUT /v1/services/:id — Atualizar serviço (admin)

```bash
curl -s -X PUT "$BASE/services/$SERVICE_ID" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: $KEYCLOAK_ID" \
  -d '{
    "name": "Limpeza Completa Premium",
    "description": "Limpeza completa com produtos premium"
  }' | jq
```

**Resposta esperada — 200**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "categoryId": "550e8400-e29b-41d4-a716-446655440003",
  "name": "Limpeza Completa Premium",
  "description": "Limpeza completa com produtos premium"
}
```

---

## Providers

### POST /v1/providers — Criar perfil de prestador

```bash
curl -s -X POST "$BASE/providers" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "businessName": "João Limpezas Ltda",
    "description": "Especialista em limpeza residencial com 10 anos de experiência"
  }' | jq
```

**Resposta esperada — 201**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "businessName": "João Limpezas Ltda",
  "description": "Especialista em limpeza residencial com 10 anos de experiência",
  "isAvailable": true,
  "verificationStatus": "PENDING",
  "createdAt": "2026-04-05T22:00:00.000Z"
}
```

**Erro — prestador já existe para esse usuário — 409**
```json
{
  "statusCode": 409,
  "code": "PROVIDER_ALREADY_EXISTS",
  "message": "Provider profile already exists for this user."
}
```

---

### GET /v1/providers — Listar prestadores aprovados

```bash
curl -s "$BASE/providers" | jq
```

**Resposta esperada — 200**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "businessName": "João Limpezas Ltda",
    "description": "Especialista em limpeza residencial",
    "isAvailable": true,
    "verificationStatus": "APPROVED",
    "createdAt": "2026-04-05T22:00:00.000Z"
  }
]
```

---

### GET /v1/providers/admin/pending — Listar pendentes de verificação (admin)

```bash
curl -s "$BASE/providers/admin/pending" \
  -H "X-User-Id: $KEYCLOAK_ID" | jq
```

**Resposta esperada — 200**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440013",
    "userId": "550e8400-e29b-41d4-a716-446655440014",
    "businessName": "Maria Elétrica",
    "verificationStatus": "UNDER_REVIEW",
    "createdAt": "2026-04-05T22:00:00.000Z"
  }
]
```

---

### GET /v1/providers/:id — Buscar prestador por ID

```bash
curl -s "$BASE/providers/$PROVIDER_ID" | jq
```

**Resposta esperada — 200**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "businessName": "João Limpezas Ltda",
  "description": "Especialista em limpeza residencial",
  "isAvailable": true,
  "verificationStatus": "APPROVED",
  "createdAt": "2026-04-05T22:00:00.000Z"
}
```

**Erro — não encontrado — 404**
```json
{
  "statusCode": 404,
  "code": "PROVIDER_NOT_FOUND",
  "message": "Provider not found."
}
```

---

### PUT /v1/providers/:id — Atualizar perfil do prestador

```bash
curl -s -X PUT "$BASE/providers/$PROVIDER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "João Limpezas Premium",
    "description": "Serviços premium de limpeza residencial e comercial",
    "isAvailable": false
  }' | jq
```

**Resposta esperada — 200**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "businessName": "João Limpezas Premium",
  "description": "Serviços premium de limpeza residencial e comercial",
  "isAvailable": false,
  "verificationStatus": "APPROVED"
}
```

---

### GET /v1/providers/:id/services — Listar serviços do prestador

```bash
curl -s "$BASE/providers/$PROVIDER_ID/services" | jq
```

**Resposta esperada — 200**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440015",
    "providerId": "550e8400-e29b-41d4-a716-446655440002",
    "serviceId": "550e8400-e29b-41d4-a716-446655440004",
    "priceBase": 150.00,
    "priceType": "FIXED",
    "service": {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "name": "Limpeza Completa"
    }
  }
]
```

---

### POST /v1/providers/:id/services — Vincular serviço ao prestador

```bash
curl -s -X POST "$BASE/providers/$PROVIDER_ID/services" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "550e8400-e29b-41d4-a716-446655440004",
    "priceBase": 150.00,
    "priceType": "FIXED"
  }' | jq
```

**Resposta esperada — 201**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440015",
  "providerId": "550e8400-e29b-41d4-a716-446655440002",
  "serviceId": "550e8400-e29b-41d4-a716-446655440004",
  "priceBase": 150.00,
  "priceType": "FIXED"
}
```

**Erro — serviço já vinculado — 409**
```json
{
  "statusCode": 409,
  "code": "PROVIDER_SERVICE_ALREADY_LINKED",
  "message": "This service is already linked to the provider."
}
```

---

### DELETE /v1/providers/:id/services/:serviceId — Desvincular serviço

```bash
curl -s -X DELETE "$BASE/providers/$PROVIDER_ID/services/$SERVICE_ID" \
  -o /dev/null -w "%{http_code}\n"
```

**Resposta esperada — 204** *(sem body)*

---

### GET /v1/providers/:id/work-locations — Listar locais de atendimento

```bash
curl -s "$BASE/providers/$PROVIDER_ID/work-locations" | jq
```

**Resposta esperada — 200**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440016",
    "providerId": "550e8400-e29b-41d4-a716-446655440002",
    "addressId": "550e8400-e29b-41d4-a716-446655440005",
    "name": "Zona Sul SP",
    "isPrimary": true,
    "address": {
      "city": "São Paulo",
      "state": "SP",
      "neighborhood": "Vila Mariana"
    }
  }
]
```

---

### POST /v1/providers/:id/work-locations — Adicionar local de atendimento

```bash
curl -s -X POST "$BASE/providers/$PROVIDER_ID/work-locations" \
  -H "Content-Type: application/json" \
  -d '{
    "addressId": "550e8400-e29b-41d4-a716-446655440005",
    "name": "Zona Sul SP",
    "isPrimary": true
  }' | jq
```

**Resposta esperada — 201**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440016",
  "providerId": "550e8400-e29b-41d4-a716-446655440002",
  "addressId": "550e8400-e29b-41d4-a716-446655440005",
  "name": "Zona Sul SP",
  "isPrimary": true
}
```

---

### DELETE /v1/providers/:id/work-locations/:locationId — Remover local de atendimento

```bash
LOCATION_ID="550e8400-e29b-41d4-a716-446655440016"

curl -s -X DELETE "$BASE/providers/$PROVIDER_ID/work-locations/$LOCATION_ID" \
  -o /dev/null -w "%{http_code}\n"
```

**Resposta esperada — 204** *(sem body)*

---

### POST /v1/providers/:id/verification — Submeter para verificação

```bash
curl -s -X POST "$BASE/providers/$PROVIDER_ID/verification" \
  -H "X-User-Id: $KEYCLOAK_ID" | jq
```

**Resposta esperada — 201**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440017",
  "providerId": "550e8400-e29b-41d4-a716-446655440002",
  "status": "UNDER_REVIEW",
  "submittedAt": "2026-04-05T22:00:00.000Z",
  "reviewedAt": null,
  "reviewedBy": null,
  "rejectionReason": null
}
```

**Erro — transição de status inválida — 422**
```json
{
  "statusCode": 422,
  "code": "PROVIDER_INVALID_VERIFICATION_STATUS",
  "message": "Invalid verification status transition."
}
```

---

### GET /v1/providers/:id/verification — Status de verificação

```bash
curl -s "$BASE/providers/$PROVIDER_ID/verification" | jq
```

**Resposta esperada — 200**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440017",
  "providerId": "550e8400-e29b-41d4-a716-446655440002",
  "status": "UNDER_REVIEW",
  "submittedAt": "2026-04-05T22:00:00.000Z",
  "reviewedAt": null,
  "reviewedBy": null,
  "rejectionReason": null
}
```

---

### PUT /v1/providers/:id/verification/approve — Aprovar verificação (admin)

```bash
curl -s -X PUT "$BASE/providers/$PROVIDER_ID/verification/approve" \
  -H "X-User-Id: $KEYCLOAK_ID" | jq
```

**Resposta esperada — 200**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440017",
  "providerId": "550e8400-e29b-41d4-a716-446655440002",
  "status": "APPROVED",
  "submittedAt": "2026-04-05T22:00:00.000Z",
  "reviewedAt": "2026-04-05T23:00:00.000Z",
  "reviewedBy": "auth0|abc123def456",
  "rejectionReason": null
}
```

---

### PUT /v1/providers/:id/verification/reject — Rejeitar verificação (admin)

```bash
curl -s -X PUT "$BASE/providers/$PROVIDER_ID/verification/reject" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: $KEYCLOAK_ID" \
  -d '{ "reason": "Documentos insuficientes. Envie CPF e comprovante de residência." }' | jq
```

**Resposta esperada — 200**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440017",
  "providerId": "550e8400-e29b-41d4-a716-446655440002",
  "status": "REJECTED",
  "submittedAt": "2026-04-05T22:00:00.000Z",
  "reviewedAt": "2026-04-05T23:00:00.000Z",
  "reviewedBy": "auth0|abc123def456",
  "rejectionReason": "Documentos insuficientes. Envie CPF e comprovante de residência."
}
```

---

## Service Requests

### POST /v1/service-requests — Criar solicitação de serviço

```bash
curl -s -X POST "$BASE/service-requests" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: $KEYCLOAK_ID" \
  -d '{
    "providerId": "550e8400-e29b-41d4-a716-446655440002",
    "serviceId": "550e8400-e29b-41d4-a716-446655440004",
    "addressId": "550e8400-e29b-41d4-a716-446655440005",
    "description": "Preciso de limpeza completa em apartamento de 60m²",
    "scheduledAt": "2026-04-10T09:00:00.000Z",
    "priceFinal": 150.00
  }' | jq
```

**Resposta esperada — 201**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440006",
  "customerId": "550e8400-e29b-41d4-a716-446655440001",
  "providerId": "550e8400-e29b-41d4-a716-446655440002",
  "serviceId": "550e8400-e29b-41d4-a716-446655440004",
  "addressId": "550e8400-e29b-41d4-a716-446655440005",
  "description": "Preciso de limpeza completa em apartamento de 60m²",
  "scheduledAt": "2026-04-10T09:00:00.000Z",
  "priceFinal": 150.00,
  "status": "PENDING",
  "createdAt": "2026-04-05T22:00:00.000Z"
}
```

**Erro — prestador não aprovado — 422**
```json
{
  "statusCode": 422,
  "code": "SERVICE_REQUEST_PROVIDER_NOT_APPROVED",
  "message": "Provider is not approved to receive service requests."
}
```

---

### GET /v1/service-requests — Listar solicitações do usuário autenticado

```bash
# Como contratante (customer)
curl -s "$BASE/service-requests" \
  -H "X-User-Id: $KEYCLOAK_ID" \
  -H "X-User-Type: CUSTOMER" | jq

# Como prestador
curl -s "$BASE/service-requests" \
  -H "X-User-Id: $KEYCLOAK_ID" \
  -H "X-User-Type: PROVIDER" | jq
```

**Resposta esperada — 200**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440006",
    "status": "PENDING",
    "scheduledAt": "2026-04-10T09:00:00.000Z",
    "priceFinal": 150.00,
    "createdAt": "2026-04-05T22:00:00.000Z"
  }
]
```

---

### GET /v1/service-requests/:id — Buscar solicitação por ID

```bash
curl -s "$BASE/service-requests/$SERVICE_REQUEST_ID" | jq
```

**Resposta esperada — 200**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440006",
  "customerId": "550e8400-e29b-41d4-a716-446655440001",
  "providerId": "550e8400-e29b-41d4-a716-446655440002",
  "serviceId": "550e8400-e29b-41d4-a716-446655440004",
  "description": "Preciso de limpeza completa em apartamento de 60m²",
  "scheduledAt": "2026-04-10T09:00:00.000Z",
  "priceFinal": 150.00,
  "status": "PENDING",
  "createdAt": "2026-04-05T22:00:00.000Z"
}
```

---

### PUT /v1/service-requests/:id/accept — Aceitar solicitação (prestador)

```bash
curl -s -X PUT "$BASE/service-requests/$SERVICE_REQUEST_ID/accept" \
  -H "X-User-Id: $KEYCLOAK_ID" | jq
```

**Resposta esperada — 200**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440006",
  "status": "ACCEPTED",
  "updatedAt": "2026-04-05T22:30:00.000Z"
}
```

---

### PUT /v1/service-requests/:id/reject — Rejeitar solicitação (prestador)

```bash
curl -s -X PUT "$BASE/service-requests/$SERVICE_REQUEST_ID/reject" \
  -H "X-User-Id: $KEYCLOAK_ID" | jq
```

**Resposta esperada — 200**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440006",
  "status": "REJECTED",
  "updatedAt": "2026-04-05T22:30:00.000Z"
}
```

---

### PUT /v1/service-requests/:id/complete — Confirmar conclusão (contratante)

```bash
curl -s -X PUT "$BASE/service-requests/$SERVICE_REQUEST_ID/complete" \
  -H "X-User-Id: $KEYCLOAK_ID" | jq
```

**Resposta esperada — 200**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440006",
  "status": "COMPLETED",
  "updatedAt": "2026-04-05T23:00:00.000Z"
}
```

**Erro — transição inválida (ex: já cancelada) — 422**
```json
{
  "statusCode": 422,
  "code": "SERVICE_REQUEST_INVALID_STATUS_TRANSITION",
  "message": "Invalid status transition for this service request."
}
```

---

### PUT /v1/service-requests/:id/cancel — Cancelar solicitação (contratante)

```bash
curl -s -X PUT "$BASE/service-requests/$SERVICE_REQUEST_ID/cancel" \
  -H "X-User-Id: $KEYCLOAK_ID" | jq
```

**Resposta esperada — 200**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440006",
  "status": "CANCELLED",
  "updatedAt": "2026-04-05T22:45:00.000Z"
}
```

---

## Reviews

### POST /v1/reviews — Criar avaliação

> Só é possível após a solicitação estar com status `COMPLETED`.

```bash
curl -s -X POST "$BASE/reviews" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: $KEYCLOAK_ID" \
  -d '{
    "serviceRequestId": "550e8400-e29b-41d4-a716-446655440006",
    "rating": 5,
    "comment": "Serviço excelente! Muito pontual e caprichoso."
  }' | jq
```

**Resposta esperada — 201**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440007",
  "serviceRequestId": "550e8400-e29b-41d4-a716-446655440006",
  "customerId": "550e8400-e29b-41d4-a716-446655440001",
  "providerId": "550e8400-e29b-41d4-a716-446655440002",
  "rating": 5,
  "comment": "Serviço excelente! Muito pontual e caprichoso.",
  "createdAt": "2026-04-05T23:30:00.000Z"
}
```

**Erro — serviço não concluído — 422**
```json
{
  "statusCode": 422,
  "code": "REVIEW_SERVICE_REQUEST_NOT_COMPLETED",
  "message": "Cannot review a service request that is not completed."
}
```

**Erro — avaliação já existe — 409**
```json
{
  "statusCode": 409,
  "code": "REVIEW_ALREADY_EXISTS",
  "message": "A review already exists for this service request."
}
```

---

### GET /v1/reviews/provider/:providerId — Avaliações de um prestador

```bash
curl -s "$BASE/reviews/provider/$PROVIDER_ID" | jq
```

**Resposta esperada — 200**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440007",
    "serviceRequestId": "550e8400-e29b-41d4-a716-446655440006",
    "rating": 5,
    "comment": "Serviço excelente! Muito pontual e caprichoso.",
    "createdAt": "2026-04-05T23:30:00.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440018",
    "serviceRequestId": "550e8400-e29b-41d4-a716-446655440019",
    "rating": 4,
    "comment": "Bom serviço, chegou um pouco atrasado.",
    "createdAt": "2026-04-04T18:00:00.000Z"
  }
]
```

---

## Documents

### POST /v1/documents — Upload de documento

> Content-Type deve ser `multipart/form-data`. Limite: 50 MB.

```bash
curl -s -X POST "$BASE/documents" \
  -H "X-User-Id: $KEYCLOAK_ID" \
  -F "file=@/caminho/para/documento.pdf" \
  -F "documentType=CPF" | jq
```

**Resposta esperada — 201**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440008",
  "providerId": "550e8400-e29b-41d4-a716-446655440002",
  "documentType": "CPF",
  "status": "PENDING",
  "createdAt": "2026-04-05T22:00:00.000Z"
}
```

**Tipos de documento aceitos:** `CPF` | `CNH` | `DIPLOMA`

---

### GET /v1/documents/:id/url — URL assinada para download

```bash
curl -s "$BASE/documents/$DOCUMENT_ID/url" \
  -H "X-User-Id: $KEYCLOAK_ID" | jq
```

**Resposta esperada — 200**
```json
{
  "url": "https://storage.zolve.com/documents/doc.pdf?X-Amz-Signature=abc...&X-Amz-Expires=900",
  "expiresIn": 900000
}
```

---

### PUT /v1/documents/:id/approve — Aprovar documento (admin)

```bash
curl -s -X PUT "$BASE/documents/$DOCUMENT_ID/approve" \
  -H "X-User-Id: $KEYCLOAK_ID" | jq
```

**Resposta esperada — 200**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440008",
  "status": "APPROVED",
  "reviewedAt": "2026-04-05T23:00:00.000Z"
}
```

---

### PUT /v1/documents/:id/reject — Rejeitar documento (admin)

```bash
curl -s -X PUT "$BASE/documents/$DOCUMENT_ID/reject" \
  -H "X-User-Id: $KEYCLOAK_ID" | jq
```

**Resposta esperada — 200**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440008",
  "status": "REJECTED",
  "reviewedAt": "2026-04-05T23:00:00.000Z"
}
```

**Erro — transição inválida — 422**
```json
{
  "statusCode": 422,
  "code": "DOCUMENT_INVALID_STATUS_TRANSITION",
  "message": "Invalid status transition for this document."
}
```

---

## Notifications

### GET /v1/notifications — Listar notificações

```bash
curl -s "$BASE/notifications" \
  -H "X-User-Id: $KEYCLOAK_ID" | jq
```

**Resposta esperada — 200**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440009",
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Solicitação aceita",
    "body": "O prestador João aceitou sua solicitação de limpeza.",
    "type": "SERVICE_REQUEST_ACCEPTED",
    "isRead": false,
    "createdAt": "2026-04-05T22:30:00.000Z"
  }
]
```

---

### PUT /v1/notifications/:id/read — Marcar como lida

```bash
curl -s -X PUT "$BASE/notifications/$NOTIFICATION_ID/read" \
  -H "X-User-Id: $KEYCLOAK_ID" \
  -o /dev/null -w "%{http_code}\n"
```

**Resposta esperada — 204** *(sem body)*

---

## Fluxo completo de exemplo

Script que exercita o fluxo end-to-end da plataforma do cadastro até a avaliação:

```bash
#!/bin/bash
set -e
BASE="http://localhost:3333/v1"

echo "=== 1. Criar usuário contratante ==="
CUSTOMER=$(curl -s -X POST "$BASE/users" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Maria Contratante","keycloakId":"kc-customer-001"}')
echo $CUSTOMER | jq .
CUSTOMER_ID=$(echo $CUSTOMER | jq -r '.id')

echo "=== 2. Criar usuário prestador ==="
PROVIDER_USER=$(curl -s -X POST "$BASE/users" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Carlos Prestador","keycloakId":"kc-provider-001"}')
PROVIDER_USER_ID=$(echo $PROVIDER_USER | jq -r '.id')

echo "=== 3. Criar perfil do prestador ==="
PROVIDER=$(curl -s -X POST "$BASE/providers" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$PROVIDER_USER_ID\",\"businessName\":\"Carlos Clean\",\"description\":\"Limpeza profissional\"}")
echo $PROVIDER | jq .
PROVIDER_ID=$(echo $PROVIDER | jq -r '.id')

echo "=== 4. Criar categoria ==="
CATEGORY=$(curl -s -X POST "$BASE/categories" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: kc-admin-001" \
  -d '{"name":"Limpeza","slug":"limpeza"}')
CATEGORY_ID=$(echo $CATEGORY | jq -r '.id')

echo "=== 5. Criar serviço ==="
SERVICE=$(curl -s -X POST "$BASE/services" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: kc-admin-001" \
  -d "{\"categoryId\":\"$CATEGORY_ID\",\"name\":\"Limpeza Completa\"}")
SERVICE_ID=$(echo $SERVICE | jq -r '.id')

echo "=== 6. Vincular serviço ao prestador ==="
curl -s -X POST "$BASE/providers/$PROVIDER_ID/services" \
  -H "Content-Type: application/json" \
  -d "{\"serviceId\":\"$SERVICE_ID\",\"priceBase\":120.00,\"priceType\":\"FIXED\"}" | jq .

echo "=== 7. Aprovar prestador (admin) ==="
curl -s -X POST "$BASE/providers/$PROVIDER_ID/verification" \
  -H "X-User-Id: kc-provider-001" | jq .
curl -s -X PUT "$BASE/providers/$PROVIDER_ID/verification/approve" \
  -H "X-User-Id: kc-admin-001" | jq .

echo "=== 8. Adicionar endereço ao contratante ==="
ADDRESS=$(curl -s -X POST "$BASE/users/me/addresses" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: kc-customer-001" \
  -d '{"street":"Av. Paulista","number":"1000","neighborhood":"Bela Vista","city":"São Paulo","state":"SP","zipCode":"01310-100","isPrimary":true}')
ADDRESS_ID=$(echo $ADDRESS | jq -r '.id')

echo "=== 9. Criar solicitação de serviço ==="
SR=$(curl -s -X POST "$BASE/service-requests" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: kc-customer-001" \
  -d "{\"providerId\":\"$PROVIDER_ID\",\"serviceId\":\"$SERVICE_ID\",\"addressId\":\"$ADDRESS_ID\",\"scheduledAt\":\"2026-04-10T09:00:00.000Z\",\"priceFinal\":120.00}")
echo $SR | jq .
SR_ID=$(echo $SR | jq -r '.id')

echo "=== 10. Prestador aceita ==="
curl -s -X PUT "$BASE/service-requests/$SR_ID/accept" \
  -H "X-User-Id: kc-provider-001" | jq .

echo "=== 11. Contratante confirma conclusão ==="
curl -s -X PUT "$BASE/service-requests/$SR_ID/complete" \
  -H "X-User-Id: kc-customer-001" | jq .

echo "=== 12. Contratante avalia prestador ==="
curl -s -X POST "$BASE/reviews" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: kc-customer-001" \
  -d "{\"serviceRequestId\":\"$SR_ID\",\"rating\":5,\"comment\":\"Perfeito! Recomendo.\"}" | jq .

echo "=== Fluxo completo finalizado ==="
```

---

## Referência rápida de erros comuns

| Código HTTP | Code | Quando ocorre |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Body inválido, campo obrigatório ausente |
| 401 | `UNAUTHORIZED_ACCESS` | `X-User-Id` ausente em rota protegida |
| 404 | `USER_NOT_FOUND` | Usuário não existe |
| 404 | `PROVIDER_NOT_FOUND` | Prestador não existe |
| 404 | `CATEGORY_NOT_FOUND` | Categoria não existe |
| 404 | `SERVICE_NOT_FOUND` | Serviço não existe |
| 404 | `SERVICE_REQUEST_NOT_FOUND` | Solicitação não existe |
| 404 | `DOCUMENT_NOT_FOUND` | Documento não existe |
| 409 | `DUPLICATE_KEYCLOAK_ID` | Usuário já cadastrado com esse keycloakId |
| 409 | `PROVIDER_ALREADY_EXISTS` | Prestador já existe para esse usuário |
| 409 | `PROVIDER_SERVICE_ALREADY_LINKED` | Serviço já vinculado ao prestador |
| 409 | `CATEGORY_DUPLICATE_SLUG` | Slug de categoria já em uso |
| 409 | `REVIEW_ALREADY_EXISTS` | Solicitação já foi avaliada |
| 422 | `SERVICE_REQUEST_PROVIDER_NOT_APPROVED` | Prestador não está aprovado |
| 422 | `SERVICE_REQUEST_INVALID_STATUS_TRANSITION` | Transição de status inválida |
| 422 | `REVIEW_SERVICE_REQUEST_NOT_COMPLETED` | Serviço ainda não concluído |
| 422 | `PROVIDER_INVALID_VERIFICATION_STATUS` | Transição de verificação inválida |
| 422 | `DOCUMENT_INVALID_STATUS_TRANSITION` | Transição de documento inválida |
