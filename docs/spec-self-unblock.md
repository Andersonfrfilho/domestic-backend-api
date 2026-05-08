# Self-Unblock & Reminder Flow — Specification

## Visão Geral

Quando um conflito é detectado (email/phone já verificado por outra conta), o usuário **não é bloqueado imediatamente**. Tem 5 dias para resolver, com lembretes diários. Pode auto-desbloquear provando ser o dono do recurso.

```
Dia 1 → ⚠️ Alerta + canRetryAt = now + 5d
Dia 2 → 📧 Lembrete email + push
Dia 3 → 📧 Lembrete email + push
Dia 4 → 📧 Lembrete email + push (último aviso)
Dia 5 → 🔒 Bloqueio definitivo (se não resolveu)
```

---

## 1. Auto-Desbloqueio

### Quem pode se desbloquear

| Reason | Auto-desbloqueio | Método |
|--------|------------------|--------|
| `EMAIL_CONFLICT` | ✅ Sim | Código enviado para o email conflitante |
| `PHONE_CONFLICT` | ✅ Sim | Código enviado para o phone conflitante |
| `VERIFICATION_FAILED` | ✅ Sim | Aguardar `canRetryAt` + tentar novamente |
| `DOCUMENT_CONFLICT` | ⚠️ Parcial | Upload de foto (verificação manual) |
| `FRAUD_SUSPICION` | ❌ Não | Suporte |
| `TERMS_VIOLATION` | ❌ Não | Suporte |
| `MANUAL_BLOCK` | ❌ Não | Suporte |
| `ACCOUNT_DISABLED` | ❌ Não | Suporte |

### Endpoints

#### Iniciar auto-desbloqueio
```http
POST /v1/account-block/{blockId}/self-unlock
```

**Request:**
```json
{
  "method": "code" // "code" | "upload" (para documento)
}
```

**Regras:**
- Só permitido se `reason` for `EMAIL_CONFLICT` ou `PHONE_CONFLICT`
- Só permitido se block ainda não foi resolvido
- Envia código para o recurso conflitante (email ou phone)

**Response (200):**
```json
{
  "success": true,
  "message": "Código enviado para o email em conflito",
  "expiresIn": 300
}
```

#### Validar código
```http
POST /v1/account-block/{blockId}/self-unlock/verify
```

**Request:**
```json
{
  "code": "123456"
}
```

**Regras:**
- Código expira em 5 minutos
- Máximo 3 tentativas
- Se código válido → resolve o block + transfere o vínculo

**Response (200) — Sucesso:**
```json
{
  "success": true,
  "message": "Conta desbloqueada. Email verificado com sucesso.",
  "blockResolved": true,
  "emailVerified": true
}
```

**Response (409) — Limite de tentativas:**
```json
{
  "success": false,
  "message": "Muitas tentativas. O código expirou.",
  "blockResolved": false,
  "canRetryAt": "2026-05-13T14:30:00Z" // +1 hora
}
```

---

## 2. Lembretes Diários (Worker)

### Worker Job: `daily-block-reminder`

Disparado por cron **1x ao dia** (ex: 10:00 AM).

```typescript
interface BlockReminderEvent {
  blockId: string;
  userId: string;
  reason: string;
  day: number; // 1 a 5
  canRetryAt: string;
}
```

### Regras de envio

| Dia | Tipo | Mensagem | Ações |
|-----|------|----------|-------|
| 1 | Push + Email | "Seu email já está em uso por outra conta. Verifique agora para não perder o acesso." | `Verificar Agora` `Lembrar Depois` |
| 2 | Push + Email | "Lembrete: seu email está em conflito. Resolva em até 3 dias." | `Verificar Agora` |
| 3 | Push + Email | "Atenção: falta 2 dias para sua conta ser bloqueada." | `Verificar Agora` |
| 4 | Push + Email | "Último aviso: amanhã sua conta será bloqueada permanentemente." | `Verificar Agora` `Falar com Suporte` |
| 5 | — | Bloqueio definitivo | contact_support, go_to_login |

### Template Email

Reutilizar `verification_code.hbs` com contexto de block:
```json
{
  "template_id": "account_block_reminder",
  "to": "user@example.com",
  "variables": {
    "day": "3",
    "reason": "EMAIL_CONFLICT",
    "canRetryAt": "2026-05-12T10:00:00Z"
  }
}
```

---

## 3. Notificações ao usuário original

Quando o auto-desbloqueio transfere o vínculo, o **usuário que perdeu** o vínculo deve ser notificado:

```http
POST /v1/notifications
```

```json
{
  "userId": "uuid-do-usuario-que-perdeu",
  "type": "email",
  "template": "link_transferred",
  "variables": {
    "resource": "anderson@mail.com",
    "newOwnerName": "João Silva"
  }
}
```

---

## 4. Fluxo Mobile (Tela de Block)

### Tela: `BlockedAccountScreen`

**Tempos de exibição:**

| Estado | O que mostrar | Botões |
|--------|---------------|--------|
| `canRetryAt` no futuro + dia ≤ 4 | "Você tem {dias} dias para resolver" | `Resolver Agora` `Lembrar Depois` |
| `canRetryAt` passou + dia = 5 | "Conta bloqueada permanentemente" | `Falar com Suporte` `Voltar ao Login` |
| `reason` = EMAIL_CONFLICT + auto-unlock disponível | "Este email é seu? Prove" | `Enviar Código` |
| Após enviar código | "Código enviado para {email}" | Input código + `Verificar` |

### Navegação

```
BlockedAccountScreen
  ├── "Resolver Agora" → SelfUnlockScreen
  │   ├── Email → "Enviar código para {email}"
  │   └── Phone → "Enviar código para {phone}"
  ├── "Lembrar Depois" → Home (com badge no perfil)
  ├── "Falar com Suporte" → WhatsApp/Email
  └── "Voltar ao Login" → LoginScreen
```

---

## 5. Endpoints Resumo

| Método | Path | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/v1/users/me/account-status` | Status do block | JWT |
| POST | `/v1/account-block/{blockId}/self-unlock` | Iniciar auto-desbloqueio | JWT |
| POST | `/v1/account-block/{blockId}/self-unlock/verify` | Validar código | JWT |
| POST | `/v1/account-block/{blockId}/resolve` | Admin resolve | Admin |

---

## 6. Checklist Backend

- [ ] Endpoint `POST /self-unlock` — envia código para recurso conflitante
- [ ] Endpoint `POST /self-unlock/verify` — valida código e transfere vínculo
- [ ] Transferência de vínculo: remover de UserA, adicionar em UserB
- [ ] Notificação ao usuário que perdeu o vínculo
- [ ] Worker job `daily-block-reminder` com template email
- [ ] Template email `account_block_reminder.hbs`
- [ ] `canRetryAt` incrementa +1h após 3 tentativas falhas
