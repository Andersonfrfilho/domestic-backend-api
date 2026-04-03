# 📊 Checklist Interativo - Domestic Backend API

## 🎯 Visão Geral do Projeto

**Status Global:** 🟡 20% (Estrutura + BD + Auth setup)  
**Total de Módulos:** 15  
**Linhas de Código Esperadas:** ~15.000+  
**Tempo Estimado:** 6-8 semanas com 1 dev full-time

---

## 📦 MÓDULOS - STATUS

### Camada 1: Autenticação & Base

| Módulo           | Status  | Tasks                    | Priority    | Sprint |
| ---------------- | ------- | ------------------------ | ----------- | ------ |
| **Auth**         | 🔴 15%  | Guards, JWT, Keycloak    | 🔴 CRITICAL | W1     |
| **Health Check** | 🟢 100% | ✅ Pronto                | 🟠 HIGH     | W1     |
| **Core**         | 🟡 50%  | Decorators, Interceptors | 🟠 HIGH     | W1     |

**Semana 1 Status:** ⏳ Em andamento

- [ ] Auth guards 80% completo
- [ ] JWT strategy configurado
- [ ] Testes de auth iniciados

---

### Camada 2: Dados do Usuário

| Módulo      | Status | Tasks             | Priority | Sprint |
| ----------- | ------ | ----------------- | -------- | ------ |
| **User**    | 🔴 0%  | CRUD, Profile     | 🟠 HIGH  | W2-W3  |
| **Email**   | 🔴 0%  | M2M, Verification | 🟠 HIGH  | W2     |
| **Phone**   | 🟡 30% | M2M, OTP, SMS     | 🟠 HIGH  | W2     |
| **Address** | 🟡 30% | M2M, Geolocation  | 🟠 HIGH  | W2     |

**Progress:** 15%

---

### Camada 3: Prestadores de Serviço

| Módulo               | Status | Tasks        | Priority | Sprint |
| -------------------- | ------ | ------------ | -------- | ------ |
| **Provider Profile** | 🔴 0%  | CRUD, Rating | 🟠 HIGH  | W3     |
| **Category**         | 🔴 0%  | CRUD, Cache  | 🟠 HIGH  | W3     |
| **Service**          | 🔴 0%  | CRUD, Cache  | 🟠 HIGH  | W3     |
| **Provider-Service** | 🔴 0%  | Pricing, M2M | 🟠 HIGH  | W3     |

**Progress:** 0%

---

### Camada 4: Agendamentos & Avaliações

| Módulo              | Status | Tasks                | Priority  | Sprint |
| ------------------- | ------ | -------------------- | --------- | ------ |
| **Service-Request** | 🔴 0%  | CRUD, Status Flow    | 🟠 HIGH   | W4     |
| **Review**          | 🔴 0%  | CRUD, Rating Stats   | 🟠 HIGH   | W4     |
| **Document**        | 🔴 0%  | Upload, Verification | 🟡 MEDIUM | W5     |

**Progress:** 0%

---

### Camada 5: Serviços Auxiliares

| Módulo            | Status | Tasks             | Priority  | Sprint |
| ----------------- | ------ | ----------------- | --------- | ------ |
| **Notification**  | 🔴 0%  | Email, SMS, Queue | 🟡 MEDIUM | W5     |
| **Cache Service** | 🔴 0%  | Redis, TTL        | 🟡 MEDIUM | W5     |
| **Cron Service**  | 🔴 0%  | Scheduled Tasks   | 🟡 MEDIUM | W5     |
| **File Storage**  | 🔴 0%  | S3/Local Upload   | 🟡 MEDIUM | W5     |
| **Analytics**     | 🔴 0%  | DataDog, Logs     | 🟡 MEDIUM | W6     |

**Progress:** 0%

---

## 📅 Roadmap por Semana

### ✅ Semana 1: Setup Inicial

**Objetivo:** Ter estrutura base e auth funcionando

- [x] Migrations do BD completas
- [x] Keycloak configurado
- [ ] Auth module com JWT
- [ ] Guards e Decorators
- [ ] Setup de testes
- [ ] Health check
- [ ] Testes e2e básicos

**Duração:** ~40 horas  
**Próximas tarefas liberadas após:** Core setup 100%

---

### ⏳ Semana 2-3: Dados do Usuário

**Objetivo:** CRUD completo de usuários e seus dados

- [ ] User module (CRUD)
- [ ] Email module (M2M)
- [ ] Phone module (M2M + OTP)
- [ ] Address module (M2M + Geo)
- [ ] Testes e2e por módulo
- [ ] Validações

**Tasks por concluir:** 40+  
**Duração:** ~80 horas  
**Bloqueadores:** Auth module 100%

---

### ⏳ Semana 3-4: Serviços

**Objetivo:** Estrutura de serviços e prestadores

- [ ] Category module
- [ ] Service module
- [ ] Provider module
- [ ] Provider-Service module
- [ ] Cache para categorias/serviços
- [ ] Testes e2e

**Tasks por concluir:** 30+  
**Duração:** ~60 horas  
**Bloqueadores:** User + Email modules 100%

---

### ⏳ Semana 4-5: Agendamentos

**Objetivo:** Requisições e avaliações funcionando

- [ ] Service-Request module
- [ ] Review module
- [ ] Status flow completo
- [ ] Autorização por role
- [ ] Testes e2e

**Tasks por concluir:** 40+  
**Duração:** ~80 horas  
**Bloqueadores:** Provider + Service modules 100%

---

### ⏳ Semana 5-6: Serviços Auxiliares

**Objetivo:** Notificações, Cache, Cron

- [ ] Notification service
- [ ] Email templates
- [ ] SMS com Twilio
- [ ] Cache (Redis) setup
- [ ] Cron tasks
- [ ] Document upload
- [ ] Testes de integração

**Tasks por concluir:** 50+  
**Duração:** ~100 horas  
**Bloqueadores:** Service-Request + Review 100%

---

### ⏳ Semana 6-7: Otimizações

**Objetivo:** Performance, Security, Deploy ready

- [ ] Database indices otimizados
- [ ] Query performance tuning
- [ ] Security audit
- [ ] CORS configurado
- [ ] Rate limiting
- [ ] DataDog setup
- [ ] CI/CD pipeline
- [ ] Docker otimizado
- [ ] Testes de carga

**Tasks por concluir:** 25+  
**Duração:** ~50 horas  
**Bloqueadores:** Todos módulos 100%

---

## 🎯 Quick Action Items (Próximas 24h)

### Alta Prioridade 🔴

- [ ] Completar Auth module (guards + strategies)
- [ ] Criar User repository com todos métodos
- [ ] Setup de testes e2e (framework)

### Médio Prazo (This Week)

- [ ] User controller básico
- [ ] Email repository
- [ ] Phone repository

### Próximo Sprint (W2 Início)

- [ ] Email & Phone controllers
- [ ] Address queries com PostGIS
- [ ] Provider profile setup

---

## 📊 Dashboard de Métricas

### Cobertura de Código

```
Target: >80% unitários, >60% e2e
Current:
  - Auth: 45% 🟡
  - User: 0% 🔴
  - Overall: 15% 🟡
```

### Endpoints Implementados

```
Total esperado: ~110+ endpoints
Implementado: ~15 (15%)
  ✅ Health check
  ✅ Keycloak setup
  🔄 Auth (em desenvolvimento)
  ❌ Demais módulos
```

### Performance

```
P95 Latency: Target <300ms
Current: N/A (não deployado)
Database: ✅ Otimizado
Cache: ⏳ Pendente
```

---

## 🚀 Tarefas Desbloqueadoras

### Para liberar Semana 2:

1. ✅ Keycloak setup completo
2. ⏳ Auth guards & strategies implementados
3. ⏳ Testes de auth passando
4. ⏳ User repository criado

### Para liberar Semana 3:

1. ⏳ Email/Phone/Address repositories
2. ⏳ CRUD endpoints testados
3. ⏳ Migrations executadas com sucesso

### Para liberar Semana 4:

1. ⏳ Service-Request business logic (status flow)
2. ⏳ Provider perfil 100% completo
3. ⏳ Cache implementado

---

## 💡 Dicas de Desenvolvimento

### Padrão de Implementação (cada módulo):

```
1. Entity (domain/)
2. Repository (infrastructure/)
3. DTOs (infrastructure/)
4. Use Cases (application/)
5. Service (infrastructure/)
6. Controller (infrastructure/)
7. Testes unitários
8. Testes e2e
9. Documentação Swagger
10. Cache/Índices de DB
```

### Checklist antes de marcar como "DONE":

- [ ] Testes rodando (min 70% coverage)
- [ ] Endpoints documentados no Swagger
- [ ] Testes e2e passando
- [ ] Performance OK (< 300ms P95)
- [ ] Sem console.log
- [ ] Sem TODO/FIXME (ou em issue)
- [ ] Código revisado
- [ ] PR mergeado

---

## 📞 Contato & Suporte

**Documentação Completa:**

- [Módulos Roadmap](./MODULES_ROADMAP.md)
- [Tasks por Módulo](./TASKS_BY_MODULE.md)
- [Arquitetura](./ARCHITECTURE.md)

**Referências:**

- DBML: `diagramdb.dbml`
- Keycloak Config: `keycloak-config/domestic-backend-realm.json`
- Docker: `docker-compose.yml`
- Migrations: `src/modules/shared/providers/database/migrations/`

**Comandos Úteis:**

```bash
# Iniciar tudo
make all

# Limpar e reiniciar
make clean && make all

# Testes
npm run test
npm run test:e2e

# Build
npm run build

# Migrations
npm run migration:run
npm run migration:revert
```

---

## 📝 Notas

- Usar Clean Architecture em todos os módulos
- Manter DTOs e Entities separados
- Use-cases devem ser testáveis (sem dependências de framework)
- Controllers apenas conversão de chamadas HTTP
- Tests devem ser determinísticos
- DB queries otimizadas desde o início
- Cache estruturado por chave padrão
- Logs estruturados em JSON
