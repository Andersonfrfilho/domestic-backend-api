# 📦 Module Template

Padrão para criação de novos módulos seguindo **Clean Architecture** com **NestJS + TypeORM**.

---

## 1. Estrutura de Diretórios

```
src/modules/<module-name>/
│
├── application/
│   ├── use-cases/
│   │   └── create-<name>.use-case.ts
│   ├── interfaces/
│   │   └── <name>.interface.ts
│   ├── types/
│   │   └── <name>.types.ts
│   ├── dtos/
│   │   └── create-<name>.dto.ts
│   ├── factories/
│   │   └── <name>.error.factory.ts
│   └── constants/
│       └── <name>.constant.ts
│
├── domain/
│   └── repositories/
│       └── <name>.repository.interface.ts
│
├── infrastructure/
│   ├── repositories/
│   │   └── <name>-<relation>.repository.ts
│   ├── <name>.controller.ts
│   ├── <name>.repository.ts
│   ├── <name>.service.ts
│   └── <name>.token.ts
│
├── shared/
│   └── dtos/
│       ├── create-<name>-request.dto.ts
│       └── create-<name>-response.dto.ts
│
└── <name>.module.ts
```

---

## 2. Camadas e Responsabilidades

| Camada             | Responsabilidade                                        |
| ------------------ | ------------------------------------------------------- |
| `application/`     | Use Cases, interfaces, tipos, fábricas de erro, DTOs    |
| `domain/`          | Interfaces de repositório (contratos)                   |
| `infrastructure/`  | Implementações: repositório TypeORM, controller, service |
| `shared/`          | DTOs de request/response (Swagger + validação)          |

> **Nota:** Entidades TypeORM ficam em `src/modules/shared/domain/entities/` (compartilhadas entre módulos).

---

## 3. Regras

- Sempre criar a **interface do repositório** (`domain/`) antes da implementação
- **Use Cases** devem depender apenas de interfaces, nunca de implementações
- **Infrastructure** implementa as interfaces do `domain/`
- Usar **tokens de injeção** (`<name>.token.ts`) para DI do NestJS
- DTOs de request usam `class-validator` + `@nestjs/swagger`

---

## 4. Convenções de Nomenclatura

| Item              | Padrão                                          | Exemplo                          |
| ----------------- | ----------------------------------------------- | -------------------------------- |
| Token de DI       | `<NAME>_REPOSITORY_PROVIDE`                     | `USER_REPOSITORY_PROVIDE`        |
| Use Case          | `<Name>Application<Action>UseCase`              | `UserApplicationCreateUseCase`   |
| Repository Impl   | `<Name>Repository`                              | `UserRepository`                 |
| Repository Iface  | `<Name>RepositoryInterface`                     | `UserRepositoryInterface`        |
| Error Factory     | `<Name>ErrorFactory`                            | `UserErrorFactory`               |
| Request DTO       | `Create<Name>RequestDto`                        | `CreateUserRequestDto`           |
| Response DTO      | `Create<Name>ResponseDto`                       | `CreateUserResponseDto`          |

---

## 5. Fluxo de Execução

```
Controller → Service → UseCase → RepositoryInterface → Repository (TypeORM)
```

### Exemplo com DI:

```typescript
// Token
export const USER_REPOSITORY_PROVIDE = 'USER_REPOSITORY_PROVIDE';

// Module
{
  provide: USER_REPOSITORY_PROVIDE,
  useClass: UserRepository,
}

// Use Case (injeta pela interface)
@Inject(USER_REPOSITORY_PROVIDE)
private readonly userRepo: UserRepositoryInterface;
```

---

## 6. Entidade Compartilhada

Entidades TypeORM ficam centralizadas em:

```
src/modules/shared/domain/entities/<name>.entity.ts
```

Elas são registradas no DataSource em:

```
src/modules/shared/infrastructure/providers/database/implementations/postgres/postgres.database-connection.ts
```