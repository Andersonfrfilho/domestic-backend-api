# Keycloak Config

Realm `domestic-backend` importado automaticamente ao subir o container.

## Arquitetura de autenticação

```
Usuário → token Keycloak → Kong (valida JWT + injeta X-User-Id + remove Authorization)
                                 ↓
                    BFF → Backend API com token client_credentials do BFF + X-User-Id
```

> Kong faz toda a validação. Os serviços (API, BFF) **nunca** chamam o Keycloak diretamente.  
> Em dev local (sem Kong), simula-se o comportamento manualmente conforme abaixo.

---

## Usuários de teste

| Usuário              | Email                    | Senha                      | Roles                                              |
|----------------------|--------------------------|----------------------------|----------------------------------------------------|
| admin                | admin@domestic.local     | ChangeMeSecurePassword123! | admin, user-manager, service-manager               |
| contractor-test      | contractor@domestic.local| ChangeMeSecurePassword123! | contractor                                         |
| provider-test        | provider@domestic.local  | ChangeMeSecurePassword123! | provider                                           |
| support-test         | support@domestic.local   | ChangeMeSecurePassword123! | support, document-verifier                         |

## Clients (B2B)

| Client ID                  | Secret                      | Roles do service account                                              |
|----------------------------|-----------------------------|-----------------------------------------------------------------------|
| domestic-backend-bff       | backend-bff-client-secret   | user-manager, manage-requests, manage-reviews, send-notifications     |
| domestic-backend-worker    | backend-worker-client-secret| manage-requests, send-notifications                                   |
| domestic-backend-cron      | backend-cron-client-secret  | manage-requests, manage-reviews, send-notifications                   |
| domestic-api               | api-client-secret           | introspection (backend API)                                           |
| domestic-backend-kong      | backend-kong-client-secret  | Kong service account — autentica chamadas upstream ao BFF e API       |

---

## Dev local — simular chamada BFF → Backend API

### 1. Token do serviço BFF (client_credentials)

```bash
curl -s -X POST 'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token' -H 'Content-Type: application/x-www-form-urlencoded' -d 'grant_type=client_credentials' -d 'client_id=domestic-backend-bff' -d 'client_secret=backend-bff-client-secret'
```

### 2. Obter keycloak_id de um usuário (login direto — apenas dev)

```bash
curl -s -X POST 'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token' -H 'Content-Type: application/x-www-form-urlencoded' -d 'grant_type=password' -d 'client_id=domestic-backend-bff' -d 'client_secret=backend-bff-client-secret' -d 'username=admin@domestic.local' -d 'password=ChangeMeSecurePassword123!'
```

> O campo `sub` do JWT retornado é o `keycloak_id` do usuário — use como `X-User-Id`.

### 3. Chamar endpoint protegido (simulando Kong + BFF)

Substitua `<BFF_TOKEN>` pelo `access_token` do passo 1 e `<KEYCLOAK_ID>` pelo `sub` do passo 2.

```bash
curl -s 'http://localhost:3333/v1/users/me' -H 'Authorization: Bearer <BFF_TOKEN>' -H 'X-User-Id: <KEYCLOAK_ID>'
```

### Introspection manual (debug)

```bash
curl -s -X POST 'http://localhost:8080/realms/domestic-backend/protocol/openid-connect/token/introspect' -H 'Content-Type: application/x-www-form-urlencoded' -d 'token=<TOKEN>' -d 'client_id=domestic-api' -d 'client_secret=api-client-secret'
```
