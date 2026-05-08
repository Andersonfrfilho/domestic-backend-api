# Fluxo de Cadastro e Verificação — Implementação Mobile

## 1. Fluxo Principal

```
[Formulário + Termos] → [Verificar Disponibilidade] → [Criar Conta] → [Verificar Email/SMS] → [Conta Ativa]
                              ↓
                    (email, phone, documento já existem?)
```

### Etapa 1 — Formulário + Termos
- Usuário preenche: nome, email, phone, documento (CPF/CNPJ), senha
- Aceita os termos de uso
- **NÃO** bloqueia por email/phone não verificado ainda

### Etapa 2 — Verificação de Disponibilidade (durante digitação)
Enquanto o usuário digita, chamar:

| Campo | Endpoint | O que checa |
|-------|----------|-------------|
| email | `POST /bff/onboarding/verify/email` | Keycloak + DB local |
| phone | `POST /bff/onboarding/verify/phone` | DB local |
| document | `POST /bff/onboarding/verify/document` | DB local |

### Etapa 3 — Criação de Conta
`POST /bff/onboarding/register`

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
{
  "userId": "uuid",
  "keycloakId": "uuid"
}
```

> ⚠️ A conta é criada com status `PENDING`. O usuário NÃO consegue acessar áreas restritas até verificar email E phone.

### Etapa 4 — Verificação de Email

1. **Solicitar código:** `POST /bff/onboarding/verification/send`
   ```json
   { "type": "email", "destination": "user@example.com" }
   ```
   → Worker envia email via Mailpit/SMTP com template `verification_code.hbs`

2. **Validar código:** `POST /bff/onboarding/verification/verify`
   ```json
   { "type": "email", "destination": "user@example.com", "code": "123456" }
   ```
   → Email marcado como `verified=true` no Keycloak

### Etapa 5 — Verificação de SMS

Mesmo fluxo, alterando `type` para `"sms"`.

---

## 2. Pular Verificação (Verificar Depois)

O usuário pode optar por **"Verificar depois"** no cadastro. Nesse caso:

- Conta é criada com status `PENDING`
- Ao fazer login, o app **DEVE**:
  1. Verificar se `emailVerified === false` ou `phoneVerified === false`
  2. Se sim, redirecionar para tela de verificação (`VerificationScreen`)
  3. Só liberar o acesso principal após ambos verificados

### Endpoint para checar status:
`GET /v1/users/me/verification-status`

```json
{
  "emailVerified": false,
  "phoneVerified": false,
  "status": "PENDING"
}
```

---

## 3. Lembrar Conta (Login Posterior)

Se o usuário escolheu **"Lembrar conta"** e sai do app, ao retornar:

1. App faz login automático (token salvo)
2. Verifica `GET /v1/users/me/verification-status`
3. Se `emailVerified === false` ou `phoneVerified === false` → redireciona para verificação
4. Se ambos `true` → acesso normal

---

## 4. Conflito de Cadastro (Conta Bloqueada)

Se durante a verificação de email ou phone for detectado que **já existe outro usuário com aquele email/phone verificado ativo**, e o usuário atual tentar ativar o mesmo:

1. **Email:** se email já verificado pertence a outra conta → **CONTA BLOQUEADA TEMPORARIAMENTE**
2. **Phone:** mesmo comportamento
3. O sistema desativa a conta atual e exibe tela: *"Sua conta foi temporariamente bloqueada. Entre em contato com o suporte."*

### Motivação:
- Impede que dois usuários tenham o mesmo email/phone verificado
- Protege contra roubo de conta
- Força resolução manual pelo suporte

### Resolução:
- Suporte analisa o caso e decide qual conta mantém o vínculo
- Após resolução, suporte reativa a conta correta e remove o vínculo da outra

---

## 5. Endpoints Resumo

| Método | Path | Descrição |
|--------|------|-----------|
| POST | `/bff/onboarding/register` | Criar conta (Keycloak + DB) |
| POST | `/bff/onboarding/verify/email` | Verificar se email existe |
| POST | `/bff/onboarding/verify/phone` | Verificar se phone existe |
| POST | `/bff/onboarding/verify/document` | Verificar se documento existe |
| POST | `/bff/onboarding/verification/send` | Solicitar código |
| POST | `/bff/onboarding/verification/verify` | Validar código |
| POST | `/bff/onboarding/documents/upload` | Upload de documento |
| GET | `/v1/users/me/verification-status` | Status da verificação |
| GET | `/bff/app-config` | Config inicial (telas, versão) |
