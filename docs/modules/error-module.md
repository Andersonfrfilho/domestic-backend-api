# 🚨 Error Module

Padrão para tratamento de erros seguindo **Clean Architecture** com **NestJS**.

---

## 1. Estrutura de Diretórios

```
src/modules/error/
│
├── application/
│   ├── app.error.factory.ts          # Factory base (validation, notFound, conflict, etc.)
│   └── factories/
│       ├── base.error.factory.ts     # Classe base abstrata para factories de domínio
│       ├── auth.error.factory.ts
│       ├── user.error.factory.ts
│       ├── config.error.factory.ts
│       ├── method-not-implemented.error.factory.ts
│       ├── rate-limit.error.factory.ts
│       └── index.ts
│
├── domain/
│   ├── app.error.ts                  # Classe AppError + ErrorType enum
│   │
│   ├── error-codes/                  # ✅ Um arquivo por domínio
│   │   ├── auth.error-codes.ts
│   │   ├── user.error-codes.ts
│   │   ├── rate-limit.error-codes.ts
│   │   ├── config.error-codes.ts
│   │   ├── method-not-implemented.error-codes.ts
│   │   ├── cache.error-codes.ts
│   │   └── index.ts                  # Barrel: exporta todos os enums + ErrorCode union
│   │
│   ├── configs/                      # Configs de mensagens de erro por domínio
│   │   ├── error-config.interface.ts
│   │   ├── auth-error.config.ts
│   │   ├── user-error.config.ts
│   │   ├── config-error.config.ts
│   │   ├── rate-limit-error.config.ts
│   │   ├── method-not-implemented-error.config.ts
│   │   └── index.ts
│   │
│   └── constants/
│       └── error-messages.constant.ts
│
├── infrastructure/
│   └── filters/
│       ├── error-filter.ts           # ExceptionFilter global
│       └── filter.error.module.ts
│
├── dtos/
│   └── errors.dto.ts
│
├── error.module.ts
└── index.ts                          # Barrel público do módulo
```

---

## 2. Camadas e Responsabilidades

| Camada           | Responsabilidade                                           |
| ---------------- | ---------------------------------------------------------- |
| `domain/`        | Error codes (enums), configs (mensagens), AppError (classe)|
| `application/`   | Factories que criam instâncias de `AppError`               |
| `infrastructure/`| Exception filters do NestJS (HTTP layer)                   |
| `dtos/`          | DTOs de resposta de erro para Swagger                      |

---

## 3. Padrão: Error Codes

Cada domínio tem seu enum em `domain/error-codes/<domain>.error-codes.ts`:

```typescript
// domain/error-codes/user.error-codes.ts
export enum UserErrorCode {
  DUPLICATE_EMAIL = 'DUPLICATE_EMAIL',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  // ...
}
```

O barrel `index.ts` re-exporta tudo + tipo union:

```typescript
export { AuthErrorCode } from './auth.error-codes';
export { UserErrorCode } from './user.error-codes';
// ...

export type ErrorCode =
  | UserErrorCode
  | AuthErrorCode
  | string;
```

---

## 4. Padrão: Error Configs

Cada domínio tem seu config em `domain/configs/<domain>-error.config.ts`:

```typescript
// domain/configs/user-error.config.ts
export const USER_ERROR_CONFIGS = {
  duplicateEmail: (email: string): ConflictErrorConfig => ({
    message: 'User with this email already exists',
    code: UserErrorCode.DUPLICATE_EMAIL,
    details: { email },
  }),
} as const;
```

> **Regra:** configs usam `as const` para type safety.

---

## 5. Padrão: Error Factories

Cada domínio tem sua factory em `application/factories/<domain>.error.factory.ts`:

```typescript
// application/factories/user.error.factory.ts
export class UserErrorFactory extends BaseErrorFactory {
  static duplicateEmail(email: string) {
    return this.createConflict(USER_ERROR_CONFIGS.duplicateEmail(email));
  }
}
```

A `BaseErrorFactory` delega para `AppErrorFactory`:

```
UserErrorFactory.duplicateEmail(email)
  → BaseErrorFactory.createConflict(config)
    → AppErrorFactory.conflict(config)
      → new AppError({ type: CONFLICT, statusCode: 409, ... })
```

---

## 6. Como Adicionar um Novo Erro

1. Adicionar código no enum: `domain/error-codes/<domain>.error-codes.ts`
2. Adicionar config de mensagem: `domain/configs/<domain>-error.config.ts`
3. Adicionar método na factory: `application/factories/<domain>.error.factory.ts`
4. Usar nos use cases: `throw UserErrorFactory.duplicateEmail(email)`

---

## 7. Convenções de Nomenclatura

| Item           | Padrão                                  | Exemplo                              |
| -------------- | --------------------------------------- | ------------------------------------ |
| Enum           | `<Domain>ErrorCode`                     | `UserErrorCode`                      |
| Enum value     | `SCREAMING_SNAKE_CASE`                  | `DUPLICATE_EMAIL`                    |
| Config object  | `<DOMAIN>_ERROR_CONFIGS`                | `USER_ERROR_CONFIGS`                 |
| Config method  | `camelCase` descritivo                  | `duplicateEmail(email)`              |
| Factory class  | `<Domain>ErrorFactory`                  | `UserErrorFactory`                   |
| Factory method | `static camelCase` (mesmo nome do config)| `static duplicateEmail(email)`      |
| Arquivo enum   | `<domain>.error-codes.ts`               | `user.error-codes.ts`                |
| Arquivo config | `<domain>-error.config.ts`              | `user-error.config.ts`               |
