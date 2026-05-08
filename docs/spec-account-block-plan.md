# Spec-Driven Development: Account Block Status

## Referência
`docs/flow-account-block.md` — Spec completo com endpoint, schemas e regras de negócio.

## Status Atual

| Item | Status | Observação |
|------|--------|------------|
| `account_blocks` table | ❌ Não existe | Precisa criar migration |
| `GET /v1/users/me/account-status` | ❌ Não existe | Precisa criar endpoint |
| Block creation on conflict | ❌ Não existe | Só retorna 409 hoje |
| Admin resolve endpoint | ❌ Não existe | Precisa criar |
| Notification to original owner | ❌ Não existe | Webhook/evento |

---

## Tarefas

### Fase 1 — Banco de Dados

- [ ] **Criar migration** `account_blocks` com campos: `id`, `user_id`, `reason`, `message`, `blocked_at`, `resolved_at`, `resolved_by`, `can_retry_at`, `metadata`
- [ ] **Criar entity** `AccountBlock` no TypeORM
- [ ] Registrar no `postgres.database-connection.ts`

### Fase 2 — Endpoint de Status

- [ ] **Criar `GetAccountBlockStatusUseCase`**: busca block ativo do usuário
- [ ] **Criar `AccountBlockService`**: orquestra regras de negócio
- [ ] **Criar `GET /v1/users/me/account-status`** no `UserController` (ou novo controller)
- [ ] Retornar schema completo: `blocked`, `status`, `reason`, `message`, `title`, `icon`, `severity`, `actions`, `canRetryAt`

### Fase 3 — Block na Verificação

- [ ] **Detectar conflito durante verificação de email**: quando email já verificado por outro usuário
- [ ] **Detectar conflito durante verificação de phone**: quando phone já verificado por outro usuário
- [ ] **Criar block** com `reason: EMAIL_CONFLICT` / `PHONE_CONFLICT`
- [ ] Retornar erro 409 com hint de redirect

### Fase 4 — Admin

- [ ] **Criar `POST /admin/account-blocks/:id/resolve`**: resolve block
- [ ] **Criar `GET /admin/account-blocks`**: listar blocks ativos (opcional)

### Fase 5 — BFF Proxy

- [ ] **Criar `GET /bff/users/me/account-status`** no BFF que proxy para API
- [ ] Adicionar rota no Kong: `/bff/users/me/account-status`

---

## Regras de Negócio (do spec)

| Reason Code | Gatilho | Ações |
|-------------|---------|-------|
| `EMAIL_CONFLICT` | Email já verificado em outra conta | contact_support, go_to_login |
| `PHONE_CONFLICT` | Phone já verificado em outra conta | contact_support, go_to_login |
| `DOCUMENT_CONFLICT` | CPF/CNPJ já registrado | contact_support, go_to_login |
| `FRAUD_SUSPICION` | Detecção de fraude | contact_support, logout |
| `VERIFICATION_FAILED` | Muitas tentativas falhas | retry, contact_support |

## Arquitetura

```
API: AccountBlock entity → GetAccountBlockStatusUseCase → Controller
BFF: Proxy GET /bff/users/me/account-status → API
Kong: Rota pública ou JWT para /bff/users/me/account-status
```

> ⚠️ Todo o código fica na **API** (regra de negócio). O BFF apenas proxy.
