# ⚡ Quick Reference Guide - Desenvolvimento Rápido

## 🔧 Comandos Essenciais

### Setup & Ambiente

```bash
# Instalar dependências
npm install

# Setup Keycloak e BD completo
make all

# Limpar tudo (containers + volumes)
make clean

# Parar todos os serviços
make down

# Ver logs
docker-compose logs -f api
docker-compose logs -f keycloak
```

### Testes

```bash
# Rodar testes unitários
npm run test

# Watch mode
npm run test -- --watch

# Cobertura
npm run test -- --coverage

# Testes e2e
npm run test:e2e

# Um arquivo específico
npm run test -- src/modules/auth/auth.service.spec.ts
```

### Desenvolvimento

```bash
# Dev server com reload
npm run start:dev

# Build
npm run build

# Rodar build
npm run start:prod

# Lint
npm run lint
npm run lint:fix
```

### Migrations

```bash
# Criar nova migração
npm run typeorm -- migration:create src/modules/shared/infrastructure/providers/database/migrations/CreateTableName

# Rodar migrações
npm run migration:run

# Reverter última
npm run migration:revert

# Ver status
npm run typeorm -- migration:show
```

### Database

```bash
# Conectar PostgreSQL (terminal)
psql -h localhost -U postgres -d domestic_db

# Executar query
psql -h localhost -U postgres -d domestic_db -c "SELECT * FROM users;"

# Dump
pg_dump -h localhost -U postgres -d domestic_db > backup.sql

# Restore
psql -h localhost -U postgres -d domestic_db < backup.sql
```

---

## 📐 Padrão de Arquitetura

### Clean Architecture Layer

```
┌─────────────────────────────────────────┐
│       PRESENTATION LAYER                │
│  Controllers / REST Endpoints / Guards  │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│     APPLICATION LAYER                   │
│  Use Cases / Services / DTOs            │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│      DOMAIN LAYER                       │
│  Entities / Business Rules / Interfaces │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│    INFRASTRUCTURE LAYER                 │
│  Repositories / Mappers / Providers     │
└─────────────────────────────────────────┘
```

### Estrutura de Pasta (por módulo)

```
src/modules/user/
├── domain/
│   ├── entities/
│   │   └── user.entity.ts
│   └── interfaces/
│       └── user.repository.interface.ts
├── application/
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   └── user.dto.ts
│   └── use-cases/
│       ├── create-user.usecase.ts
│       ├── get-user.usecase.ts
│       ├── update-user.usecase.ts
│       ├── delete-user.usecase.ts
│       └── list-users.usecase.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── user.repository.ts
│   │   └── user.mapper.ts
│   ├── services/
│   │   └── user.service.ts
│   └── controllers/
│       └── user.controller.ts
└── user.module.ts
```

---

## 🏗️ Templates Rápidos

### Entity Template

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('tablename')
export class TableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
```

### Repository Template

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableEntity } from '../../domain/entities/table.entity';

@Injectable()
export class TableRepository {
  constructor(
    @InjectRepository(TableEntity)
    private readonly repository: Repository<TableEntity>,
  ) {}

  async create(data: any): Promise<TableEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findById(id: string): Promise<TableEntity> {
    return this.repository.findOne({
      where: { id, deletedAt: null },
    });
  }

  async findAll(skip: number, take: number): Promise<[TableEntity[], number]> {
    return this.repository.findAndCount({
      where: { deletedAt: null },
      skip,
      take,
    });
  }

  async update(id: string, data: any): Promise<TableEntity> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.update(id, { deletedAt: new Date() });
  }
}
```

### Use Case Template

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { TableRepository } from '../../infrastructure/persistence/table.repository';
import { TableDto } from '../dto/table.dto';

@Injectable()
export class CreateTableUseCase {
  constructor(
    @Inject(TableRepository)
    private readonly repository: TableRepository,
  ) {}

  async execute(input: any): Promise<TableDto> {
    const entity = await this.repository.create(input);
    return this.toDto(entity);
  }

  private toDto(entity: any): TableDto {
    return new TableDto(entity);
  }
}
```

### Controller Template

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { TableService } from '../services/table.service';
import { CreateTableDto } from '../dto/create-table.dto';
import { UpdateTableDto } from '../dto/update-table.dto';

@Controller('tables')
export class TableController {
  constructor(private readonly service: TableService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTableDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTableDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
```

### Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { TableService } from './table.service';
import { TableRepository } from '../infrastructure/persistence/table.repository';

describe('TableService', () => {
  let service: TableService;
  let repository: TableRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TableService,
        {
          provide: TableRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TableService>(TableService);
    repository = module.get<TableRepository>(TableRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a record', async () => {
      const mockData = { name: 'Test' };
      jest.spyOn(repository, 'create').mockResolvedValue(mockData as any);

      const result = await service.create(mockData);
      expect(result).toEqual(mockData);
      expect(repository.create).toHaveBeenCalledWith(mockData);
    });
  });
});
```

---

## 🔐 Padrões de Segurança

### Roles Disponíveis

```typescript
enum UserRole {
  ADMIN = 'admin',
  CONTRACTOR = 'contractor',
  PROVIDER = 'provider',
  USER_MANAGER = 'user-manager',
  SERVICE_MANAGER = 'service-manager',
  DOCUMENT_VERIFIER = 'document-verifier',
  SUPPORT = 'support',
  MANAGE_SERVICES = 'manage-services',
  MANAGE_REQUESTS = 'manage-requests',
  MANAGE_REVIEWS = 'manage-reviews',
  SEND_NOTIFICATIONS = 'send-notifications',
}
```

### Usando @Roles() Decorator

```typescript
import { Controller, Get } from '@nestjs/common';
import { Roles } from '../core/decorators/roles.decorator';
import { JwtAuthGuard } from '../core/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @Roles(UserRole.ADMIN, UserRole.USER_MANAGER)
  getUsers() {
    // Apenas admin ou user-manager
  }
}
```

### Soft Delete Automatizado

```typescript
// No repository:
async findAll() {
  return this.repository.find({
    where: { deletedAt: IsNull() },
  });
}

// No service:
async delete(id: string) {
  await this.repository.update(id, {
    deletedAt: new Date(),
  });
}
```

---

## 📊 Enums Mais Usados

### User Status

```typescript
enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}
```

### Phone Type

```typescript
enum PhoneType {
  MOBILE = 'MOBILE',
  HOME = 'HOME',
  COMMERCIAL = 'COMMERCIAL',
}
```

### Price Type (Services)

```typescript
enum PriceType {
  FIXED = 'FIXED',
  HOURLY = 'HOURLY',
  PER_VISIT = 'PER_VISIT',
}
```

### Service Request Status

```typescript
enum ServiceRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}
```

### Document Type

```typescript
enum DocumentType {
  CNH = 'CNH',
  CPF = 'CPF',
  RG = 'RG',
  PASSPORT = 'PASSPORT',
  WORK_PERMIT = 'WORK_PERMIT',
  BACKGROUND_CHECK = 'BACKGROUND_CHECK',
}
```

### Document Status

```typescript
enum DocumentStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}
```

---

## 🗄️ Query Patterns

### Buscar com Relacionamentos

```typescript
async findUserWithDetails(userId: string) {
  return this.userRepository.findOne({
    where: { id: userId },
    relations: [
      'emails',
      'phones',
      'addresses',
      'providerProfile',
      'providerProfile.services',
    ],
  });
}
```

### Paginação

```typescript
async findPaginated(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  const [data, total] = await this.repository.findAndCount({
    where: { deletedAt: null },
    skip,
    take: limit,
    order: { createdAt: 'DESC' },
  });

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
```

### Com Filtros

```typescript
async findByFilters(filters: FilterDto) {
  const query = this.repository.createQueryBuilder('u');

  if (filters.name) {
    query.andWhere('u.name ILIKE :name', { name: `%${filters.name}%` });
  }

  if (filters.status) {
    query.andWhere('u.status = :status', { status: filters.status });
  }

  if (filters.fromDate) {
    query.andWhere('u.createdAt >= :fromDate', { fromDate: filters.fromDate });
  }

  return query
    .orderBy('u.createdAt', 'DESC')
    .take(10)
    .skip(0)
    .getMany();
}
```

### Agregação

```typescript
async getAverageRating(providerId: string) {
  const result = await this.reviewRepository
    .createQueryBuilder('r')
    .select('AVG(r.rating)', 'average')
    .addSelect('COUNT(r.id)', 'count')
    .where('r.provider_id = :providerId', { providerId })
    .getRawOne();

  return result;
}
```

---

## 🚀 Dicas de Performance

### Índices Obrigatórios

```typescript
// No Entity
@Index() // Busca rápida
@Column()
email: string;

@Index(['userId', 'deletedAt']) // Composite index
@Column()
userId: string;

@Index()
@Column()
status: string;
```

### Cache com Redis

```typescript
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export class CachedService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async getCategories() {
    const cached = await this.cache.get('categories');
    if (cached) return cached;

    const data = await this.repository.find();
    await this.cache.set('categories', data, 3600000); // 1h
    return data;
  }

  async invalidateCategories() {
    await this.cache.del('categories');
  }
}
```

### Query Optimization

```typescript
// ❌ Ruim: N+1
const users = await this.userRepository.find();
for (const user of users) {
  user.emails = await this.emailRepository.find({ userId: user.id });
}

// ✅ Bom: Eager load
const users = await this.userRepository.find({
  relations: ['emails'],
});
```

---

## 🧪 Testing Checklist

Antes de marcar módulo como DONE:

- [ ] Todos testes rodando (`npm run test`)
- [ ] Cobertura > 70% (`npm run test -- --coverage`)
- [ ] E2E tests passando (`npm run test:e2e`)
- [ ] Sem console.log/debugger no código
- [ ] Linting passa (`npm run lint`)
- [ ] DTOs com `@IsString()`, `@IsEmail()`, etc
- [ ] Tratamento de erros completo
- [ ] Documentação no Swagger
- [ ] Performance OK (queries < 100ms)

---

## 🐛 Debug Comum

### "Cannot find module"

```bash
# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### "Database connection refused"

```bash
# Garantir que PostgreSQL está rodando
docker-compose ps
docker-compose logs database_postgres

# Ou conectar local
make down && make all
```

### "Keycloak import failed"

```bash
# Ver logs do Keycloak
docker-compose logs keycloak

# Validar JSON
cat keycloak-config/domestic-backend-realm.json | jq . > /dev/null
```

### "Jest timeout"

```typescript
// Aumentar timeout para e2e
describe('Integration tests', () => {
  jest.setTimeout(30000); // 30s

  it('should ...', async () => {
    // test
  });
});
```

---

## 📚 Referências Importantes

**Documentação Completa:**

- [Módulos Roadmap](./MODULES_ROADMAP.md)
- [Tasks por Módulo](./TASKS_BY_MODULE.md)
- [Progress Tracker](./PROGRESS_TRACKER.md)

**Configurações:**

- Keycloak: `keycloak-config/domestic-backend-realm.json`
- Docker: `docker-compose.yml`
- Migrations: `src/modules/shared/infrastructure/providers/database/migrations/`

**Links Úteis:**

- NestJS Docs: https://docs.nestjs.com
- TypeORM Docs: https://typeorm.io
- Keycloak Docs: https://www.keycloak.org/documentation

---

## 📝 Checklist Diário de Desenvolvimento

Cada dia:

1. ☐ `make all` rodando sem erros
2. ☐ Features/testes desenvolvidas
3. ☐ Testes passando (`npm run test`)
4. ☐ Linting OK (`npm run lint`)
5. ☐ Commits com mensagens claras
6. ☐ Atualizar PROGRESS_TRACKER.md
7. ☐ Sem arquivos uncommitted

Fim do sprint:

1. ☐ Todos testes > 70% coverage
2. ☐ Documentação Swagger atualizada
3. ☐ E2E tests passando
4. ☐ Code review feito
5. ☐ Performance validada
6. ☐ Merge para main
