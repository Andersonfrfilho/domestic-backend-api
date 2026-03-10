# 📖 Documentação de Desenvolvimento - Domestic Backend API

Bem-vindo! Este é o guia central para todo o desenvolvimento do Domestic Backend API. Comece por aqui.

---

## 🎯 Comece Por Aqui (Quick Start)

### 1️⃣ Primeira Execução

```bash
# Clonar projeto (já feito)
cd /Users/anderson.filho/Documents/personal/domestic/domestic-backend-api

# Instalar dependências
npm install

# Iniciar tudo (Keycloak + BD + API)
make all

# Verificar que tudo está funcionando
curl http://localhost:3333/health
# Deve retornar: {"status":"ok"}
```

### 2️⃣ Verificar Acesso

- **API**: http://localhost:3333
- **Swagger**: http://localhost:3333/docs
- **Keycloak**: http://localhost:8080 (admin/admin)
- **PostgreSQL**: localhost:5432 (postgres/postgres)
- **Redis**: localhost:6379
- **RabbitMQ**: http://localhost:15672 (guest/guest)
- **SonarQube**: http://localhost:9001

### 3️⃣ Usuários de Teste Keycloak

```
✅ Admin
  Email: admin@domestic.local
  Senha: ChangeMeSecurePassword123!
  Roles: admin

✅ Prestador
  Email: provider@domestic.local
  Senha: ChangeMeSecurePassword123!
  Roles: provider

✅ Contratante
  Email: contractor@domestic.local
  Senha: ChangeMeSecurePassword123!
  Roles: contractor

✅ Suporte
  Email: support@domestic.local
  Senha: ChangeMeSecurePassword123!
  Roles: support, document-verifier
```

### 4️⃣ Próximos Passos

Leia **QUICK_REFERENCE.md** para templates e padrões de código.

---

## 📚 Documentos Disponíveis

### 🗺️ **[MODULES_ROADMAP.md](./MODULES_ROADMAP.md)** - Arquitetura Completa

- Visão geral dos 12 módulos principais
- 3 serviços auxiliares (Notification, Cache, Cron)
- Rotas, entidades, dependências
- Sequência de implementação
- Diagrama de relacionamentos
  **Leia quando:** Precisa entender a arquitetura geral  
  **Tamanho:** ~6000 linhas

---

### ✅ **[TASKS_BY_MODULE.md](./TASKS_BY_MODULE.md)** - Tarefas Detalhadas

- Cada módulo com suas sub-tarefas
- Prioridades 🔴🟠🟡🟢
- Caminhos de arquivos específicos
- Dependências explícitas
- Estimativas de tempo
  **Leia quando:** Vai começar a implementar um módulo  
  **Tamanho:** ~5000 linhas

---

### 📊 **[PROGRESS_TRACKER.md](./PROGRESS_TRACKER.md)** - Dashboard de Status

- Status atual de cada módulo (0-100%)
- Timeline por semana
- Quick action items
- Métricas de cobertura
- Tarefas desbloqueadoras
  **Leia quando:** Quer saber o progresso ou o que vem a seguir  
  **Tamanho:** ~400 linhas

---

### ⚡ **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Guia Prático

- Comandos essenciais (make, npm, docker)
- Templates de código (Entity, Repository, UseCase, Controller, Tests)
- Padrões de arquitetura (Clean Architecture)
- Estrutura de pastas (por módulo)
- Enums disponíveis
- Query patterns (busca, paginação, agregações)
- Dicas de performance
- Debug comum
  **Leia quando:** Precisa codificar rapidamente  
  **Tamanho:** ~800 linhas

---

### 🏗️ **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detalhes de Design

- Clean Architecture explícita
- Fluxo de requisição
- Camadas e responsabilidades
- Padrões de erro
- Estrutura de testes
  **Leia quando:** Precisa entender decisões técnicas  
  **Tamanho:** ~1500 linhas (já existente)

---

### 🗄️ **[NAMING_CONVENTIONS_STANDARD.md](./NAMING_CONVENTIONS_STANDARD.md)** - Convenção de Código

- Nomes de classes, métodos, variáveis
- Convenção de pastas
- Imports e exports
  **Leia quando:** Tem dúvidas de como nomear algo  
  **Tamanho:** ~300 linhas (já existente)

---

## 🔄 Workflow Típico do Desenvolvedor

### Segunda-feira (Planejamento)

1. Ler [PROGRESS_TRACKER.md](./PROGRESS_TRACKER.md) - qual módulo vem próximo
2. Ler módulo específico em [TASKS_BY_MODULE.md](./TASKS_BY_MODULE.md)
3. Identificar as sub-tarefas
4. Estimar tempo

### Terça-Quarta-Quinta (Desenvolvimento)

1. Usar [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) para templates
2. Implementar seguindo [MODULES_ROADMAP.md](./MODULES_ROADMAP.md)
3. Rodar testes: `npm run test:watch`
4. Linting: `npm run lint:fix`
5. Commits diários

### Sexta (Finalização)

1. Testes e2e: `npm run test:e2e`
2. Coverage > 70%: `npm run test -- --coverage`
3. Atualizar [PROGRESS_TRACKER.md](./PROGRESS_TRACKER.md)
4. Code review
5. Merge para main

---

## 🚀 Roadmap de Implementação

```
Semana 1: SETUP + AUTH (🔴 CRITICAL)
  ├─ ✅ Keycloak configurado
  ├─ ✅ Migrações do BD
  ├─ ⏳ Auth guards & JWT
  ├─ ⏳ Health check
  └─ ⏳ Testes e2e básicos

Semana 2-3: DADOS DO USUÁRIO (🟠 HIGH)
  ├─ User (CRUD)
  ├─ Email (M2M)
  ├─ Phone (M2M + OTP)
  ├─ Address (M2M + Geo)
  └─ Testes e2e

Semana 3-4: SERVIÇOS (🟠 HIGH)
  ├─ Category
  ├─ Service
  ├─ Provider
  ├─ Provider-Service
  └─ Cache

Semana 4-5: AGENDAMENTOS (🟠 HIGH)
  ├─ Service-Request
  ├─ Review
  └─ Status flow

Semana 5-6: AUXILIARES (🟡 MEDIUM)
  ├─ Notifications
  ├─ Document
  ├─ Cron tasks
  └─ Analytics

Semana 6-7: OTIMIZAÇÕES (🟡 MEDIUM)
  ├─ Performance
  ├─ Security
  ├─ CI/CD
  └─ Deploy ready
```

---

## 📁 Estrutura de Arquivos de Documentação

```
docs/
├─ README.md (este arquivo) ⭐ COMECE AQUI
├─ MODULES_ROADMAP.md (Arquitetura - 6000 linhas)
├─ TASKS_BY_MODULE.md (Tarefas - 5000 linhas)
├─ PROGRESS_TRACKER.md (Status - 400 linhas)
├─ QUICK_REFERENCE.md (Prático - 800 linhas)
├─ ARCHITECTURE.md (Design - 1500 linhas)
├─ NAMING_CONVENTIONS_STANDARD.md (Padrão - 300 linhas)
└─ ... (outros documentos de configuração)
```

---

## 🎓 Para Cada Tipo de Tarefa

### "Quero começar um novo módulo"

1. Ler: [TASKS_BY_MODULE.md](./TASKS_BY_MODULE.md) - seção do módulo
2. Usar: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - templates
3. Implementar: Entity → Repository → UseCase → Controller

### "Preciso saber o status geral"

1. Ler: [PROGRESS_TRACKER.md](./PROGRESS_TRACKER.md)
2. Ver dashboard de status
3. Identificar próximas tarefas desbloqueadoras

### "Tenho dúvida de arquitetura"

1. Ler: [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Depois: [MODULES_ROADMAP.md](./MODULES_ROADMAP.md)
3. Exemplo prático: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

### "Preciso codificar rápido"

1. Copiar template: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
2. Adaptar para seu caso
3. Seguir convenções: [NAMING_CONVENTIONS_STANDARD.md](./NAMING_CONVENTIONS_STANDARD.md)

### "Estou travado/encontrei bug"

1. Ver: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - seção "Debug Comum"
2. Rodar: `npm run lint` e `npm run test`
3. Ver logs: `docker-compose logs -f [SERVICE]`

---

## 🔐 Segurança & Autenticação

### Como Funciona

1. **Keycloak** gerencia identidades (OAuth2)
2. **JWT Strategy** valida tokens
3. **@Roles() Decorator** restringe acesso
4. **JwtAuthGuard** protege endpoints

### Exemplo de Endpoint Protegido

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  @Get()
  @Roles(UserRole.ADMIN, UserRole.USER_MANAGER) // Apenas admin e user-manager
  async listUsers() {
    // ...
  }
}
```

### Roles Disponíveis

```
🔴 admin - Acesso total
🟠 contractor - Contrata serviços
🟠 provider - Oferece serviços
🟡 user-manager - Gerencia usuários
🟡 service-manager - Gerencia serviços
🟡 document-verifier - Verifica documentos
🟢 support - Suporte
```

---

## 🗄️ Banco de Dados

### Entidades Principais

```
users (usuários finais)
├─ emails (M2M)
├─ phones (M2M + OTP)
├─ addresses (M2M + Geo)
└─ service_requests (como contratante)

provider_profiles (prestadores de serviço)
├─ emails (M2M)
├─ phones (M2M)
├─ addresses (M2M)
└─ provider_services

categories → services → provider_services

service_requests
├─ service (qual serviço)
├─ provider (quem presta)
├─ contractor (quem contrata)
└─ address (onde)

reviews (avaliações de services_requests)

documents (verificação de identidade/antecedentes)
```

### Conexão

```bash
# PostgreSQL
psql -h localhost -U postgres -d domestic_db

# Queries úteis
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
SELECT * FROM users LIMIT 5;
\d users  # Ver estrutura da tabela
```

---

## 🧪 Testes

### Rodar Testes

```bash
# Unitários
npm run test

# Watch mode
npm run test -- --watch

# Com cobertura
npm run test -- --coverage

# E2E
npm run test:e2e

# Um arquivo específico
npm run test -- src/modules/auth/auth.service.spec.ts
```

### Target de Cobertura

- Unitários: **80%+** (obrigatório)
- E2E: **60%+** (obrigatório)
- Overall: **70%+**

### Exemplo de Teste Simples

```typescript
describe('UserService', () => {
  it('should create a user', async () => {
    const input = { email: 'test@example.com', fullName: 'Test' };
    const result = await service.create(input);
    expect(result.id).toBeDefined();
  });
});
```

---

## 🚀 Deploy & Production

### Build

```bash
npm run build
npm run start:prod
```

### Docker

```bash
# Build image
docker build -f Dockerfile -t domestic-api:latest .

# Run container
docker run -p 3333:3333 --env-file .env domestic-api:latest
```

### Checklist Pré-Deploy

- [ ] Todos testes passando (80%+ unitários)
- [ ] Zero console.log / debugger
- [ ] Linting OK (`npm run lint`)
- [ ] E2E tests passando
- [ ] Performance validada (P95 < 300ms)
- [ ] Documentação Swagger atualizada
- [ ] Security audit completado
- [ ] Variáveis de ambiente configuradas

---

## 📞 Troubleshooting Rápido

### "Projeto não inicia"

```bash
# 1. Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install

# 2. Limpar containers
make clean

# 3. Recriar tudo
make all
```

### "BD não conecta"

```bash
# 1. Ver logs
docker-compose logs database_postgres

# 2. Resetar BD
docker-compose exec database_postgres psql -U postgres -c "DROP DATABASE IF EXISTS domestic_db; CREATE DATABASE domestic_db;"

# 3. Rodar migrações
npm run migration:run
```

### "Keycloak import fails"

```bash
# 1. Ver logs
docker-compose logs keycloak | tail -50

# 2. Validar JSON
cat keycloak-config/domestic-backend-realm.json | jq . > /dev/null

# 3. Reiniciar Keycloak
docker-compose restart keycloak
```

### "Testes falhando"

```bash
# 1. Rodar em watch mode
npm run test -- --watch

# 2. Limpar cache Jest
npm run test -- --clearCache

# 3. Rodar com verbosidade
npm run test -- --verbose
```

---

## 📝 Guia de Contribuição

### Ao Iniciar Novo Módulo

1. ✅ Criar pasta em `src/modules/[module-name]/`
2. ✅ Criar subpastas: domain/, application/, infrastructure/
3. ✅ Implementar: Entity → Repository → UseCase → Controller
4. ✅ Adicionar testes (min 70% coverage)
5. ✅ Atualizar [PROGRESS_TRACKER.md](./PROGRESS_TRACKER.md)
6. ✅ Commit com mensagem clara
7. ✅ PR para revisão

### Convenções de Commit

```
feat: adiciona login com Keycloak
fix: corrige soft delete em user
refactor: reorganiza repository
test: aumenta cobertura de auth
docs: atualiza PROGRESS_TRACKER
```

### Code Review Checklist

- [ ] Testes passando (80%+)
- [ ] Linting OK
- [ ] Sem console.log
- [ ] DTOs com validações
- [ ] Tratamento de erros
- [ ] Documentação Swagger
- [ ] Performance OK

---

## 🎯 Objetivos por Fase

### MVP (Semanas 1-4)

- **Semana 1:** Auth + Health check + estrutura
- **Semana 2-3:** User + Email + Phone + Address CRUD completo
- **Semana 3-4:** Service catalog funcionando

### Core Features (Semanas 4-5)

- Service requests workflow completo
- Reviews e ratings
- Basic notifications

### Production Ready (Semana 6-7)

- Document verification
- Caching otimizado
- Performance tuning
- Security audit
- CI/CD pipeline

---

## 📂 Estrutura do Projeto

```
domestic-backend-api/
├─ src/
│  ├─ config/              # Configurações globais
│  ├─ core/                # Guards, Decorators, Strategies
│  ├─ modules/             # Cada módulo aqui ⭐
│  │  ├─ auth/
│  │  ├─ user/
│  │  ├─ email/
│  │  ├─ phone/
│  │  ├─ address/
│  │  ├─ provider/
│  │  ├─ category/
│  │  ├─ service/
│  │  ├─ provider-service/
│  │  ├─ service-request/
│  │  ├─ review/
│  │  ├─ document/
│  │  ├─ notification/
│  │  ├─ cache/
│  │  ├─ cron/
│  │  └─ shared/
│  ├─ app.module.ts
│  └─ main.ts
├─ test/
│  ├─ e2e/
│  └─ unit/
├─ docs/                  # Documentação (você está aqui) ⭐
├─ keycloak-config/       # Configuração Keycloak
├─ scripts/               # Scripts úteis
├─ docker-compose.yml     # Orquestração
├─ .env                   # Variáveis de ambiente
├─ makefile              # Comandos rápidos
└─ package.json
```

---

## ✅ Próximas Ações

Você está aqui! Próximas ações recomendadas:

### Agora (Hoje)

1. ✅ `make all` para verificar setup
2. ✅ Ler [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
3. ✅ Acessar Keycloak em http://localhost:8080

### Hoje à tarde

1. 📖 Ler [MODULES_ROADMAP.md](./MODULES_ROADMAP.md) - visão geral
2. 📋 Ler [TASKS_BY_MODULE.md](./TASKS_BY_MODULE.md) - Auth module

### Amanhã (Primeira implementação)

1. 💻 Implementar Auth guards usando templates
2. 🧪 Escrever testes
3. ✅ Push para repo

---

## 📞 Suporte Rápido

**Documentos:**

- 📖 Documentação geral: Este arquivo
- 🗺️ Arquitetura: [MODULES_ROADMAP.md](./MODULES_ROADMAP.md)
- ✅ Tarefas específicas: [TASKS_BY_MODULE.md](./TASKS_BY_MODULE.md)
- 📊 Progress: [PROGRESS_TRACKER.md](./PROGRESS_TRACKER.md)
- ⚡ Quick reference: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

**Acesso Rápido:**

- API: http://localhost:3333
- Keycloak: http://localhost:8080 (admin/admin)
- DB: localhost:5432 (postgres/postgres)
- Swagger: http://localhost:3333/docs

---

**Última atualização:** 2024  
**Status:** ✅ Infrastructure Ready | 🟡 Development Ready | 🔴 Modules Pending

Bom desenvolvimento! 🚀
