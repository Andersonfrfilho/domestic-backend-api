# 🔐 Guia de Integração com Keycloak

## Overview

Keycloak é o provedor de identidade centralizado. Todas as operações de autenticação e autorização passam por Keycloak.

**URL Base:** `http://keycloak:8080`  
**Realm:** `domestic-backend`  
**Admin Credentials:** `admin:admin`

---

## 🔑 Configurações

### Cliente Backend (domestic-backend-api)

```
Client ID: domestic-backend-api
Client Secret: (via .env: BACKEND_API_CLIENT_SECRET)
Grant Types: password, refresh_token, client_credentials
Access Type: confidential
Direct Access Grants: ON
Service Accounts: ON
```

### Clientes Auxiliares

```
- domestic-worker (jobs/cron)
  Secret: WORKER_CLIENT_SECRET

- domestic-cron (tasks agendadas)
  Secret: CRON_CLIENT_SECRET
```

---

## 📡 Endpoints REST do Keycloak

### 1️⃣ Login (Resource Owner Password Flow)

```http
POST /realms/domestic-backend/protocol/openid-connect/token

Content-Type: application/x-www-form-urlencoded

grant_type=password&
username=user@example.com&
password=SecurePassword123!&
client_id=domestic-backend-api&
client_secret=<CLIENT_SECRET>
```

**Resposta:**

```json
{
  "access_token": "eyJhbGciOiJSUzI1Ni...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGciOiJSUzI1Ni...",
  "token_type": "Bearer",
  "not-before-policy": 0,
  "session_state": "...",
  "scope": "..."
}
```

**No NestJS:**

```typescript
async loginWithKeycloak(email: string, password: string) {
  const url = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

  const response = await axios.post(url,
    new URLSearchParams({
      grant_type: 'password',
      username: email,
      password: password,
      client_id: process.env.KEYCLOAK_CLIENT_ID,
      client_secret: process.env.BACKEND_API_CLIENT_SECRET,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data;
}
```

---

### 2️⃣ Refresh Token

```http
POST /realms/domestic-backend/protocol/openid-connect/token

Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&
refresh_token=<REFRESH_TOKEN>&
client_id=domestic-backend-api&
client_secret=<CLIENT_SECRET>
```

**No NestJS:**

```typescript
async refreshToken(refreshToken: string) {
  const url = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

  const response = await axios.post(url,
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.KEYCLOAK_CLIENT_ID,
      client_secret: process.env.BACKEND_API_CLIENT_SECRET,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data;
}
```

---

### 3️⃣ Criar Novo Usuário

```http
POST /admin/realms/domestic-backend/users

Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "username": "user@example.com",
  "email": "user@example.com",
  "emailVerified": false,
  "enabled": true,
  "firstName": "João",
  "lastName": "Silva",
  "credentials": [
    {
      "type": "password",
      "value": "TempPassword123!",
      "temporary": true
    }
  ],
  "requiredActions": [
    "UPDATE_PASSWORD"
  ]
}
```

**Retorna:** Status 201 + Location header com user ID

**No NestJS:**

```typescript
async createUserInKeycloak(
  email: string,
  fullName: string,
  password: string,
) {
  const adminToken = await this.getAdminToken();

  const name = fullName.split(' ');

  const response = await axios.post(
    `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`,
    {
      username: email,
      email: email,
      emailVerified: false,
      enabled: true,
      firstName: name[0],
      lastName: name[name.length - 1],
      credentials: [
        {
          type: 'password',
          value: password,
          temporary: true,
        },
      ],
      requiredActions: ['UPDATE_PASSWORD'],
    },
    {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  // Extrair ID da Location header
  const keycloakUserId = response.headers.location.split('/').pop();
  return keycloakUserId;
}
```

---

### 4️⃣ Buscar Usuário por Email

```http
GET /admin/realms/domestic-backend/users?email=user@example.com

Authorization: Bearer <ADMIN_TOKEN>
```

**Resposta:**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "user@example.com",
    "email": "user@example.com",
    "enabled": true,
    "firstName": "João",
    "lastName": "Silva",
    "emailVerified": true,
    "createdTimestamp": 1704067200000
  }
]
```

---

### 5️⃣ Atualizar Usuário

```http
PUT /admin/realms/domestic-backend/users/{userId}

Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "firstName": "João Paulo",
  "lastName": "da Silva",
  "email": "joao@example.com",
  "emailVerified": true,
  "enabled": true,
  "attributes": {
    "phone": ["+55 11 98765-4321"],
    "birth_date": ["1990-05-15"]
  }
}
```

---

### 6️⃣ Atribuir Role a Usuário

```http
POST /admin/realms/domestic-backend/users/{userId}/role-mappings/realm

Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

[
  {
    "id": "<ROLE_ID>",
    "name": "provider",
    "composite": false,
    "clientRole": false,
    "containerId": "domestic-backend"
  }
]
```

**No NestJS:**

```typescript
async assignRoleToUser(keycloakUserId: string, role: string) {
  const adminToken = await this.getAdminToken();

  // 1. Buscar role ID
  const roles = await axios.get(
    `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/roles`,
    {
      headers: { Authorization: `Bearer ${adminToken}` },
    }
  );

  const roleId = roles.data.find(r => r.name === role)?.id;

  // 2. Atribuir role
  await axios.post(
    `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${keycloakUserId}/role-mappings/realm`,
    [
      {
        id: roleId,
        name: role,
        composite: false,
        clientRole: false,
        containerId: process.env.KEYCLOAK_REALM,
      },
    ],
    {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
}
```

---

### 7️⃣ Alterar Senha de Usuário

```http
PUT /admin/realms/domestic-backend/users/{userId}/reset-password

Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "type": "password",
  "value": "NewPassword123!",
  "temporary": false
}
```

---

### 8️⃣ Resetar Senha (Enviar Email)

```http
PUT /admin/realms/domestic-backend/users/{userId}/execute-actions-email?lifespan=3600

Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

["UPDATE_PASSWORD"]
```

**Keycloak enviará email com link para reset**

---

### 9️⃣ Logout (Invalidar Token)

```http
POST /realms/domestic-backend/protocol/openid-connect/logout

Content-Type: application/x-www-form-urlencoded

refresh_token=<REFRESH_TOKEN>&
client_id=domestic-backend-api&
client_secret=<CLIENT_SECRET>
```

---

## 🛡️ JWT - Decodificando Token

### Estrutura do Token

```
Header.Payload.Signature
```

### Exemplo de Payload (após decodificar base64)

```json
{
  "exp": 1704153600,
  "iat": 1704153300,
  "auth_time": 1704153300,
  "jti": "...",
  "iss": "http://keycloak:8080/realms/domestic-backend",
  "aud": ["domestic-backend-api"],
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "typ": "Bearer",
  "azp": "domestic-backend-api",
  "nonce": "...",
  "session_state": "...",
  "acr": "1",
  "email_verified": true,
  "preferred_username": "user@example.com",
  "email": "user@example.com",
  "given_name": "João",
  "family_name": "Silva",
  "name": "João Silva",
  "realm_access": {
    "roles": ["admin", "provider"]
  },
  "resource_access": {
    "domestic-backend-api": {
      "roles": ["admin", "provider"]
    }
  }
}
```

### No NestJS (JWT Strategy)

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.KEYCLOAK_PUBLIC_KEY,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      username: payload.preferred_username,
      roles: payload.realm_access?.roles || [],
      firstName: payload.given_name,
      lastName: payload.family_name,
    };
  }
}
```

---

## 🔐 Admin Token (Service Account)

Para chamadas admin, precisa obter um token usando client credentials:

```typescript
async getAdminToken() {
  const url = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

  const response = await axios.post(url,
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: 'domestic-backend-api',
      client_secret: process.env.BACKEND_API_CLIENT_SECRET,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data.access_token;
}
```

---

## 📋 Checklist de Implementação

### Auth Module

- [ ] `loginWithKeycloak()` - teste com admin@domestic.local
- [ ] `refreshToken()` - teste com refresh token
- [ ] `createUserInKeycloak()` - teste criação de usuário
- [ ] `getAdminToken()` - reutilizar em outras operações
- [ ] `assignRoleToUser()` - teste atribuição de roles
- [ ] Cache de tokens em Redis com TTL
- [ ] Error handling para erros do Keycloak

### JWT Validation

- [ ] Extrair público key do Keycloak
- [ ] Configurar JwtStrategy corretamente
- [ ] Validar assinatura do token
- [ ] Extrair roles do token
- [ ] Cache de público key

### Testes E2E

- [ ] Login com credenciais válidas
- [ ] Login com credenciais inválidas
- [ ] Refresh token expirado
- [ ] Token expirado
- [ ] Acesso com roles corretos
- [ ] Acesso negado com roles incorretos

---

## 🚀 Fluxo Completo de Login

```
1. Cliente envia POST /auth/login { email, password }
   ↓
2. Backend chama Keycloak POST /token { email, password }
   ↓
3. Keycloak retorna { access_token, refresh_token, expires_in }
   ↓
4. Backend extrai informações do access_token (JWT)
   ↓
5. Backend retorna ao cliente { access_token, refresh_token, user }
   ↓
6. Cliente armazena tokens em localStorage/sessionStorage
   ↓
7. Cliente envia Authorization: Bearer <access_token> em próximas requisições
   ↓
8. Backend valida token no JwtAuthGuard
   ↓
9. Se token expirou, cliente refaz login ou usa refresh_token
```

---

## 🔍 Debugging

### Ver roles de um usuário

```bash
curl -H "Authorization: Bearer <ADMIN_TOKEN>" \
  http://localhost:8080/admin/realms/domestic-backend/users/<USER_ID>/role-mappings/realm
```

### Ver clientes configurados

```bash
curl -H "Authorization: Bearer <ADMIN_TOKEN>" \
  http://localhost:8080/admin/realms/domestic-backend/clients
```

### Logs do Keycloak

```bash
docker-compose logs keycloak -f
```

---

## ⚠️ Boas Práticas

1. **Nunca armazene passwords**: Keycloak é responsável
2. **Cache tokens em Redis**: Evite validar token para cada requisição
3. **Use service accounts**: Para chamadas server-to-server
4. **Valide JWT sempre**: Mesmo com cache, valide a assinatura
5. **Trate erros do Keycloak**: Rede, timeout, invalid credentials
6. **Expire cache corretamente**: Use expires_in do token para TTL
7. **Renovar access_token**: Quando estiver expirado, use refresh_token

---

## 📚 Referências

- [Keycloak Docs](https://www.keycloak.org/documentation)
- [Admin REST API](https://www.keycloak.org/docs/latest/server_admin/)
- [OpenID Connect Protocol](https://www.keycloak.org/docs/latest/securing_apps/)
- [Passport JWT](https://docs.nestjs.com/security/authentication)
- [Config do Projeto](keycloak-config/domestic-backend-realm.json)
