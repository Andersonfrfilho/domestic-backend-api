# API Specification: Account Block Status

> **Module:** BFF (Backend for Frontend)  
> **Context:** Fluxo de Cadastro e Verificação Mobile  
> **Consumer:** Mobile App (React Native)  
> **Date:** 2026-05-08

---

## 1. Endpoint

### `GET /v1/users/me/account-status`

Retorna o status atual da conta do usuário autenticado. Se a conta estiver bloqueada, inclui o motivo, mensagem explicativa e ações disponíveis.

---

## 2. Request

```http
GET /v1/users/me/account-status
Authorization: Bearer <access_token>
```

---

## 3. Response

### 200 OK — Conta Ativa

```json
{
  "blocked": false,
  "status": "ACTIVE",
  "reason": null,
  "message": null,
  "title": null,
  "icon": null,
  "severity": null,
  "actions": [],
  "canRetryAt": null
}
```

### 200 OK — Conta Bloqueada

```json
{
  "blocked": true,
  "status": "BLOCKED",
  "reason": "EMAIL_CONFLICT",
  "message": "Detectamos que este e-mail já está verificado em outra conta. Para sua segurança, esta conta foi temporariamente bloqueada.",
  "title": "Conta Temporariamente Bloqueada",
  "icon": "mail-outline",
  "severity": "error",
  "actions": [
    {
      "type": "contact_support",
      "label": "Falar com Suporte",
      "url": "https://wa.me/5511999999999?text=Olá,%20minha%20conta%20foi%20bloqueada%20por%20conflito%20de%20e-mail",
      "variant": "primary"
    },
    {
      "type": "go_to_login",
      "label": "Voltar para o Login",
      "variant": "outline"
    }
  ],
  "canRetryAt": null
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## 4. Schema

### `AccountBlockStatus`

| Field        | Type               | Required | Description                                               |
| ------------ | ------------------ | -------- | --------------------------------------------------------- |
| `blocked`    | `boolean`          | Yes      | `true` if account is blocked                              |
| `status`     | `string`           | Yes      | `"ACTIVE"` \| `"BLOCKED"` \| `"PENDING"` \| `"SUSPENDED"` |
| `reason`     | `string` \| `null` | No       | Machine-readable reason code                              |
| `message`    | `string` \| `null` | No       | Human-readable explanation                                |
| `title`      | `string` \| `null` | No       | Screen title override                                     |
| `icon`       | `string` \| `null` | No       | Ionicons icon name for mobile                             |
| `severity`   | `string` \| `null` | No       | `"error"` \| `"warning"` \| `"info"`                      |
| `actions`    | `BlockAction[]`    | Yes      | Available actions for the user                            |
| `canRetryAt` | `string` \| `null` | No       | ISO 8601 datetime when user can retry                     |

### `BlockAction`

| Field     | Type               | Required | Description                                 |
| --------- | ------------------ | -------- | ------------------------------------------- |
| `type`    | `string`           | Yes      | Action type (see below)                     |
| `label`   | `string`           | Yes      | Button text                                 |
| `url`     | `string` \| `null` | No       | URL to open (for `contact_support`)         |
| `route`   | `string` \| `null` | No       | Route to navigate (for `retry`)             |
| `variant` | `string`           | No       | `"primary"` \| `"secondary"` \| `"outline"` |

### Action Types

| Type              | Behavior                             | Requires `url` | Requires `route` |
| ----------------- | ------------------------------------ | -------------- | ---------------- |
| `contact_support` | Opens URL (WhatsApp, email, etc)     | Optional       | —                |
| `retry`           | Navigates to route or goes back      | —              | Optional         |
| `logout`          | Clears session and goes to auth flow | —              | —                |
| `go_to_login`     | Navigates to login screen            | —              | —                |
| `dismiss`         | Navigates to home screen             | —              | —                |

---

## 5. Reason Codes

### Standard Reasons

| Code                  | Trigger                                   | Severity  | Default Actions              |
| --------------------- | ----------------------------------------- | --------- | ---------------------------- |
| `EMAIL_CONFLICT`      | Email already verified by another account | `error`   | contact_support, go_to_login |
| `PHONE_CONFLICT`      | Phone already verified by another account | `error`   | contact_support, go_to_login |
| `DOCUMENT_CONFLICT`   | CPF/CNPJ already registered               | `error`   | contact_support, go_to_login |
| `FRAUD_SUSPICION`     | Fraud detection triggered                 | `error`   | contact_support, logout      |
| `TERMS_VIOLATION`     | Terms of service violated                 | `warning` | contact_support, dismiss     |
| `MANUAL_BLOCK`        | Blocked by admin/support                  | `error`   | contact_support, logout      |
| `VERIFICATION_FAILED` | Too many failed verification attempts     | `warning` | retry, contact_support       |
| `ACCOUNT_DISABLED`    | Account disabled by user or admin         | `error`   | contact_support, go_to_login |

### Custom Reasons

The backend can add new reason codes dynamically. The mobile app falls back to generic styling if the reason is unknown.

---

## 6. Business Rules

### Rule 1: Conflict Detection During Verification

When a user verifies email/phone during registration or login:

```
1. User requests verification code for email X
2. System checks if email X is already verified by another user
3. If yes:
   a. Block current account (status = BLOCKED, reason = EMAIL_CONFLICT)
   b. Send notification to original account owner
   c. Return error 409 to mobile with redirect hint
```

### Rule 2: Retry Window

For temporary blocks (e.g., `VERIFICATION_FAILED`), set `canRetryAt`:

```json
{
  "blocked": true,
  "reason": "VERIFICATION_FAILED",
  "message": "Muitas tentativas de verificação falharam. Tente novamente mais tarde.",
  "canRetryAt": "2026-05-08T14:30:00Z",
  "actions": [{ "type": "contact_support", "label": "Falar com Suporte", "variant": "secondary" }]
}
```

### Rule 3: Actions from BFF

The BFF decides which actions to show based on the context:

- **Registration conflict** → `contact_support` + `go_to_login`
- **Too many failed attempts** → `retry` + `contact_support`
- **Terms violation** → `contact_support` + `dismiss`
- **Fraud** → `contact_support` + `logout`

---

## 7. Mobile Integration

### When to Call

| Scenario          | When to call                                            |
| ----------------- | ------------------------------------------------------- |
| Post-login        | After successful Keycloak login, before routing to home |
| Post-verification | After failed verification that triggers a block         |
| Background check  | When app comes to foreground and user is logged in      |

### Mobile Flow

```typescript
// After login
const status = await KeycloakService.getAccountBlockStatus();

if (status.blocked) {
  router.replace({
    pathname: '/blocked-account',
    params: {
      reason: status.reason,
      message: status.message,
      title: status.title,
    },
  });
  return;
}

// Account is active, proceed to home
router.replace('/(app)/home');
```

### Fallback Behavior

If the endpoint fails (e.g., BFF is down), the mobile app:

1. Shows a generic block screen
2. Uses params passed from the previous screen
3. Provides default actions: `contact_support` + `go_to_login`

---

## 8. Implementation Notes

### Database Schema

```sql
CREATE TABLE account_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  reason VARCHAR(50) NOT NULL,
  message TEXT,
  blocked_at TIMESTAMP NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES admins(id),
  can_retry_at TIMESTAMP,
  metadata JSONB -- flexible field for extra context
);

CREATE INDEX idx_account_blocks_user ON account_blocks(user_id);
CREATE INDEX idx_account_blocks_reason ON account_blocks(reason);
```

### Service Logic (Pseudocode)

```typescript
async function getAccountBlockStatus(userId: string): Promise<AccountBlockStatus> {
  // 1. Check if user is blocked
  const activeBlock = await db.accountBlocks.findFirst({
    where: { userId, resolvedAt: null },
    orderBy: { blockedAt: 'desc' },
  });

  if (!activeBlock) {
    return { blocked: false, status: 'ACTIVE', actions: [] };
  }

  // 2. Determine actions based on reason
  const actions = getActionsForReason(activeBlock.reason);

  // 3. Return status
  return {
    blocked: true,
    status: 'BLOCKED',
    reason: activeBlock.reason,
    message: activeBlock.message || getDefaultMessage(activeBlock.reason),
    title: getTitleForReason(activeBlock.reason),
    icon: getIconForReason(activeBlock.reason),
    severity: getSeverityForReason(activeBlock.reason),
    actions,
    canRetryAt: activeBlock.canRetryAt?.toISOString() || null,
  };
}

function getActionsForReason(reason: string): BlockAction[] {
  switch (reason) {
    case 'EMAIL_CONFLICT':
    case 'PHONE_CONFLICT':
    case 'DOCUMENT_CONFLICT':
      return [
        {
          type: 'contact_support',
          label: 'Falar com Suporte',
          url: 'https://wa.me/5511999999999',
          variant: 'primary',
        },
        {
          type: 'go_to_login',
          label: 'Voltar para o Login',
          variant: 'outline',
        },
      ];
    case 'VERIFICATION_FAILED':
      return [
        {
          type: 'retry',
          label: 'Tentar Novamente',
          route: '/verification',
          variant: 'primary',
        },
        {
          type: 'contact_support',
          label: 'Falar com Suporte',
          variant: 'secondary',
        },
      ];
    // ... etc
  }
}
```

---

## 9. Checklist for Backend Team

- [ ] Create `account_blocks` table
- [ ] Implement `GET /v1/users/me/account-status` endpoint
- [ ] Add block creation logic in verification flow (conflict detection)
- [ ] Add support for `canRetryAt` temporary blocks
- [ ] Implement webhook/notification to original account owner on conflict
- [ ] Add admin endpoint to resolve blocks (`POST /admin/account-blocks/{id}/resolve`)
- [ ] Document new reason codes in internal wiki
