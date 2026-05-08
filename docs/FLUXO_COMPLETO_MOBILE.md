# Fluxo de Cadastro e Verificação — Documentação Mobile

## Fluxo Principal

```
[Mobile] → [Kong] → [BFF] → [API] → [Keycloak + DB]
```

## Endpoints (Kong → BFF → API)

### 1. Verificação de Disponibilidade (durante digitação)

| # | Mobile → Kong | Kong → BFF | BFF → API | Body |
|---|---------------|------------|-----------|------|
| 1 | `POST /bff/onboarding/verify/email` | `POST /bff/onboarding/verify/email` | `POST /v1/auth/verify/email` | `{ "email": "..." }` |
| 2 | `POST /bff/onboarding/verify/phone` | `POST /bff/onboarding/verify/phone` | `POST /v1/auth/verify/phone` | `{ "phone": "..." }` |
| 3 | `POST /bff/onboarding/verify/document` | `POST /bff/onboarding/verify/document` | `POST /v1/auth/verify/document` | `{ "document": "..." }` |

> ⚠️ **Campo `document`:** o mobile deve usar `document` como nome do campo, **nunca `cpf`**. O backend infere o tipo automaticamente (11 dígitos = CPF, 14 = CNPJ).

### 2. Cadastro

| # | Mobile → Kong | Kong → BFF | BFF → API | Body |
|---|---------------|------------|-----------|------|
| 4 | `POST /bff/onboarding/register` | `POST /bff/onboarding/register` | `POST /v1/onboarding/register` | Ver abaixo |

```json
{
  "email": "user@example.com",
  "firstName": "João",
  "lastName": "Silva",
  "phone": "16999999999",
  "password": "***",
  "cpf": "12345678900"
}
```

**Resposta:**
```json
{ "userId": "uuid", "keycloakId": "uuid" }
```

> A conta é criada como `PENDING`. O CPF/CNPJ é salvo como `UserDocument` com `status: "PENDING"`.

### 3. Verificação de Email/SMS

| # | Mobile → Kong | Kong → BFF | BFF → API | Body |
|---|---------------|------------|-----------|------|
| 5 | `POST /bff/onboarding/verification/send` | `POST /bff/onboarding/verification/send` | `POST /v1/auth/verification/send` | `{ "type": "email", "destination": "..." }` |
| 6 | `POST /bff/onboarding/verification/verify` | `POST /bff/onboarding/verification/verify` | `POST /v1/auth/verification/verify` | `{ "type": "email", "destination": "...", "code": "123456" }` |

### 4. Documentos (Feature Flag: `documentPhotoVerification`)

> Desabilitado por padrão. Quando ativado:

| # | Mobile → Kong | Kong → BFF | BFF → API | Descrição |
|---|---------------|------------|-----------|-----------|
| 7 | `POST /bff/onboarding/documents/upload` | `POST /bff/onboarding/documents/upload` | `POST /documents` | Upload de foto (multipart) |
| 8 | — | — | `GET /v1/users/me/documents` | Listar documentos do usuário |

### 5. Outros endpoints

| # | Mobile → Kong | Descrição |
|---|---------------|-----------|
| 9 | `GET /bff/app-config` | Feature flags, navegação, versão |
| 10 | `GET /bff/app-config` → `features.documentPhotoVerification` | Flag para upload de documento |
| 11 | `GET /v1/users/me/verification-status` | Status de verificação do usuário |

> **Nota:** `GET /v1/users/me/documents`, `GET /v1/users/me/verification-status` e `GET /v1/users/me/account-status` são endpoints diretos da API. Podem ser chamados via Kong em `/api/v1/...` (requer JWT).

## Status da Conta

```
PENDING (email/phone não verificados) → verificar email + phone → ACTIVE
```

| Status | Significado |
|--------|-------------|
| `PENDING` | Conta criada, email e/ou phone não verificados |
| `ACTIVE` | Email + phone verificados, acesso liberado |

## Status do Documento

| Status | Significado |
|--------|-------------|
| `PENDING` | Documento cadastrado (CPF/CNPJ), aguardando foto |
| `VERIFIED` | Documento verificado (aprovado pelo admin) |
| `REJECTED` | Documento rejeitado |

## Pular Verificação

Se usuário optar por "Verificar depois":
- Conta criada como `PENDING`
- Ao logar, verificar `GET /v1/users/me/verification-status`
- Se `emailVerified === false` ou `phoneVerified === false` → redirecionar para `VerificationScreen`

## Lembrar Conta (Login Posterior)

- Login automático com token salvo
- Verificar `GET /v1/users/me/verification-status`
- Se pendente → redirecionar para verificação

## Conflito de Cadastro (Conta Bloqueada)

Se email ou phone já verificado em outra conta:
1. Conta atual é bloqueada
2. Tela: *"Sua conta foi temporariamente bloqueada. Entre em contato com o suporte."*
3. Resolução manual pelo suporte

## Feature Flags

Retornadas em `GET /bff/app-config`:

```json
{
  "features": {
    "chatEnabled": true,
    "notificationsEnabled": true,
    "reviewsEnabled": true,
    "providerSearchEnabled": true,
    "documentPhotoVerification": false
  }
}
```

## Fluxo de Rede

```
Mobile → gateway.domestic.local:8000 (Kong)
  ├── /bff/* → BFF (http://bff:3001)
  │   └── BFF → API (http://api:3000) via apiClient
  ├── /api/* → API com JWT (http://api:3000)
  └── /v1/categories, /v1/services (GET, público) → API
```

## Rotas no Kong

| Path | Público | Rate Limit | Descrição |
|------|---------|------------|-----------|
| `/bff/onboarding/register` | ✅ | — | Cadastro |
| `/bff/onboarding/verify/email` | ✅ | 5/min | Verificar email |
| `/bff/onboarding/verify/phone` | ✅ | 5/min | Verificar phone |
| `/bff/onboarding/verify/document` | ✅ | 3/min | Verificar documento |
| `/bff/onboarding/verification/send` | ✅ | — | Enviar código |
| `/bff/onboarding/verification/verify` | ✅ | — | Validar código |
| `/bff/onboarding/documents/upload` | ✅ | — | Upload (feature flag) |
| `/bff/onboarding/cep` | ✅ | — | Consultar CEP |
| `/bff/auth/terms/*` | ✅ | — | Termos de uso |
| `/bff/app-config` | ✅ | — | Config inicial |
| `/bff/*` | 🔒 JWT | — | Demais rotas (companies, etc.) |
