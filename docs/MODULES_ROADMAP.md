# 🗺️ Roadmap de Módulos - Domestic Backend API

## 📋 Visão Geral

Sistema de agendamento de serviços domésticos que conecta **contratantes** e **prestadores de serviços**. O banco de dados está pronto com migrations completas.

---

## 🏗️ Estrutura de Módulos Principais

### 1️⃣ MÓDULO: Autenticação & Autorização `auth`

**Status:** ⏳ Em construção  
**Objetivo:** Integração com Keycloak, autenticação JWT, autorização por roles

#### Rotas:

```
POST   /auth/login              - Login com email/senha
POST   /auth/register           - Registro novo usuário
POST   /auth/refresh            - Renovar token JWT
POST   /auth/logout             - Logout
GET    /auth/me                 - Dados do usuário autenticado
POST   /auth/change-password    - Alterar senha
POST   /auth/forgot-password    - Solicitar reset de senha
POST   /auth/reset-password     - Reset de senha com token
```

#### Dependências:

- Keycloak (integração OAuth2)
- JWT Strategy (Passport.js)
- Redis Cache (cache de sessões)

---

### 2️⃣ MÓDULO: Usuários `user`

**Status:** ⏳ Pendente  
**Objetivo:** Gestão de usuários contratantes e prestadores

#### Rotas:

```
GET    /users                   - Listar usuários (admin)
GET    /users/:id               - Obter dados do usuário
PUT    /users/:id               - Atualizar perfil
DELETE /users/:id               - Deletar usuário (soft delete)
GET    /users/:id/status        - Status do usuário
PUT    /users/:id/status        - Atualizar status (PENDING, ACTIVE, INACTIVE)
GET    /users/search            - Buscar usuários por nome/email
```

#### Entidades relacionadas:

- `users` (principal)
- `user_emails` (múltiplos emails)
- `user_phones` (múltiplos phones)
- `user_addresses` (múltiplos endereços)
- `documents` (documentação)

#### Funcionalidades:

- ✅ CRUD de usuários
- ✅ Múltiplos emails/phones/endereços por usuário
- ✅ Soft delete com `deleted_at`
- ✅ Verificação de documentos

---

### 3️⃣ MÓDULO: Emails `email`

**Status:** ⏳ Pendente  
**Objetivo:** Gestão de emails dos usuários

#### Rotas:

```
GET    /users/:userId/emails    - Listar emails do usuário
POST   /users/:userId/emails    - Adicionar novo email
PUT    /users/:userId/emails/:emailId - Atualizar email
DELETE /users/:userId/emails/:emailId - Remover email
PUT    /users/:userId/emails/:emailId/verify - Marcar como verificado
PUT    /users/:userId/emails/:emailId/primary - Definir como primário
```

#### Entidades:

- `emails` (compartilhado)
- `user_emails` (relacionamento M2M)
- `provider_emails` (relacionamento M2M)

---

### 4️⃣ MÓDULO: Telefones `phone`

**Status:** ⏳ Em construção  
**Objetivo:** Gestão de telefones dos usuários

#### Rotas:

```
GET    /users/:userId/phones    - Listar phones do usuário
POST   /users/:userId/phones    - Adicionar novo phone
PUT    /users/:userId/phones/:phoneId - Atualizar phone
DELETE /users/:userId/phones/:phoneId - Remover phone
PUT    /users/:userId/phones/:phoneId/verify - Marcar como verificado
PUT    /users/:userId/phones/:phoneId/primary - Definir como primário
GET    /users/:userId/phones/:phoneId/send-otp - Enviar OTP
POST   /users/:userId/phones/:phoneId/verify-otp - Verificar OTP (SMS)
```

#### Entidades:

- `phones` (compartilhado)
- `user_phones` (relacionamento M2M)
- `provider_phones` (relacionamento M2M)

#### Tipos de Telefone:

- MOBILE
- LANDLINE
- WHATSAPP

---

### 5️⃣ MÓDULO: Endereços `address`

**Status:** ⏳ Em construção  
**Objetivo:** Gestão de endereços dos usuários

#### Rotas:

```
GET    /users/:userId/addresses         - Listar endereços do usuário
POST   /users/:userId/addresses         - Adicionar novo endereço
PUT    /users/:userId/addresses/:addressId - Atualizar endereço
DELETE /users/:userId/addresses/:addressId - Remover endereço
GET    /users/:userId/addresses/:addressId/verify - Solicitar verificação
PUT    /users/:userId/addresses/:addressId/verify - Marcar como verificado
PUT    /users/:userId/addresses/:addressId/primary - Definir como primário
GET    /addresses/nearby                - Buscar endereços próximos (geolocalização)
```

#### Entidades:

- `addresses` (compartilhado)
- `user_addresses` (relacionamento M2M)
- `provider_addresses` (relacionamento M2M)

#### Tipos de Endereço:

- RESIDENTIAL
- COMMERCIAL
- DELIVERY
- BILLING
- OTHER

---

### 6️⃣ MÓDULO: Perfil de Prestador `provider`

**Status:** ⏳ Pendente  
**Objetivo:** Gestão de perfis de prestadores de serviços

#### Rotas:

```
GET    /providers                       - Listar prestadores
GET    /providers/:id                   - Obter perfil do prestador
POST   /users/:userId/provider-profile  - Criar perfil de prestador
PUT    /providers/:id                   - Atualizar perfil
DELETE /providers/:id                   - Deletar perfil (soft delete)
GET    /providers/:id/rating            - Obter avaliação média
GET    /providers/:id/services          - Listar serviços oferecidos
PUT    /providers/:id/availability      - Atualizar disponibilidade
GET    /providers/search                - Buscar prestadores (filtros)
GET    /providers/:id/reviews           - Listar avaliações do prestador
```

#### Entidades relacionadas:

- `provider_profiles` (principal)
- `provider_emails` (múltiplos emails)
- `provider_phones` (múltiplos phones)
- `provider_addresses` (múltiplas localizações)
- `provider_services` (serviços oferecidos)

#### Atributos importantes:

- `business_name` - Nome do negócio
- `descriptions` - Descrição dos serviços
- `average_rating` - Avaliação média (0.0 - 5.0)
- `is_available` - Disponibilidade

---

### 7️⃣ MÓDULO: Categorias de Serviços `category`

**Status:** ⏳ Pendente  
**Objetivo:** Gestão de categorias de serviços

#### Rotas:

```
GET    /categories               - Listar categorias
GET    /categories/:id           - Obter categoria
POST   /categories               - Criar categoria (admin)
PUT    /categories/:id           - Atualizar categoria (admin)
DELETE /categories/:id           - Deletar categoria (admin)
GET    /categories/:id/services  - Listar serviços da categoria
```

#### Entidades:

- `categories` (principal)

#### Exemplos de Categorias:

- Limpeza
- Encanamento
- Eletricidade
- Jardinagem
- Reparo de Móveis
- Tutorias/Educação
- Cuidado de Crianças
- Cuidado de Pets

---

### 8️⃣ MÓDULO: Serviços `service`

**Status:** ⏳ Pendente  
**Objetivo:** Gestão de serviços disponíveis

#### Rotas:

```
GET    /services                          - Listar serviços
GET    /services/:id                      - Obter detalhes do serviço
POST   /categories/:categoryId/services   - Criar serviço (admin)
PUT    /services/:id                      - Atualizar serviço (admin)
DELETE /services/:id                      - Deletar serviço (admin)
GET    /services/:id/providers            - Listar prestadores que oferecem
GET    /services/search                   - Buscar serviços por nome
```

#### Entidades relacionadas:

- `services` (principal)
- `provider_services` (relacionamento M2M com preços)

---

### 9️⃣ MÓDULO: Serviços do Prestador `provider-service`

**Status:** ⏳ Pendente  
**Objetivo:** Gestão de serviços e preços por prestador

#### Rotas:

```
GET    /providers/:providerId/services           - Listar serviços do prestador
POST   /providers/:providerId/services           - Adicionar serviço
PUT    /providers/:providerId/services/:serviceId - Atualizar preço/tipo
DELETE /providers/:providerId/services/:serviceId - Remover serviço
GET    /providers/:providerId/services/:serviceId - Detalhes do serviço
```

#### Entidades:

- `provider_services` (relacionamento)

#### Tipos de Preço:

- FIXED (valor fixo)
- HOURLY (por hora)
- DAILY (por dia)
- MONTHLY (por mês)
- BY_PROJECT (por projeto)

#### Atributos:

- `price_base` - Valor base
- `price_type` - Tipo de precificação

---

### 🔟 MÓDULO: Requisições de Serviço `service-request`

**Status:** ⏳ Pendente  
**Objetivo:** Gestão de requisições/agendamentos de serviços

#### Rotas:

```
GET    /service-requests                           - Listar requisições (do usuário)
GET    /service-requests/:id                       - Obter detalhes
POST   /service-requests                           - Criar nova requisição
PUT    /service-requests/:id                       - Atualizar requisição
DELETE /service-requests/:id                       - Cancelar requisição
PUT    /service-requests/:id/status                - Atualizar status
PUT    /service-requests/:id/confirm-contractor   - Contratante confirma
PUT    /service-requests/:id/confirm-provider     - Prestador confirma
GET    /service-requests/:id/history              - Histórico de mudanças
POST   /service-requests/:id/messages             - Adicionar mensagem
GET    /service-requests/:id/messages             - Listar mensagens (chat)
```

#### Entidades relacionadas:

- `service_requests` (principal)
- `reviews` (avaliações)

#### Status possíveis:

- PENDING - Aguardando resposta do prestador
- ACCEPTED - Prestador aceitou
- IN_PROGRESS - Serviço em andamento
- COMPLETED - Serviço concluído
- CANCELLED - Cancelado
- REJECTED - Rejeitado

#### Fluxo:

```
1. Contratante cria requisição
   ↓
2. Prestador recebe notificação
   ↓
3. Prestador aceita/rejeita (ACCEPTED/REJECTED)
   ↓
4. Se aceito: ambos confirmam (CONFIRMED)
   ↓
5. Serviço inicia (IN_PROGRESS)
   ↓
6. Serviço finaliza (COMPLETED)
   ↓
7. Ambos avaliam (deixam review)
```

---

### 1️⃣1️⃣ MÓDULO: Avaliações `review`

**Status:** ⏳ Pendente  
**Objetivo:** Sistema de avaliações entre usuários

#### Rotas:

```
GET    /service-requests/:requestId/review        - Obter avaliação
POST   /service-requests/:requestId/review        - Criar avaliação
PUT    /service-requests/:requestId/review        - Atualizar avaliação
DELETE /service-requests/:requestId/review        - Deletar avaliação
GET    /providers/:providerId/reviews             - Listar avaliações do prestador
GET    /providers/:providerId/review-stats        - Estatísticas de avaliação
```

#### Entidades:

- `reviews` (principal)

#### Atributos:

- `rating` - Avaliação 1-5 estrelas
- `comment` - Comentário opcional
- `created_at` - Data da avaliação

---

### 1️⃣2️⃣ MÓDULO: Documentos `document`

**Status:** ⏳ Pendente  
**Objetivo:** Gestão de documentos e verificação de identidade

#### Rotas:

```
GET    /users/:userId/documents         - Listar documentos do usuário
GET    /users/:userId/documents/:id     - Obter documento
POST   /users/:userId/documents         - Upload de documento
PUT    /users/:userId/documents/:id     - Atualizar documento
DELETE /users/:userId/documents/:id     - Deletar documento
PUT    /users/:userId/documents/:id/verify - Verificar documento (admin)
GET    /documents/pending               - Listar documentos pendentes (admin)
```

#### Entidades:

- `documents` (principal)

#### Tipos de Documento:

- CPF
- CNPJ
- RG
- PASSPORT
- DRIVER_LICENSE
- PROFESSIONAL_LICENSE
- CERTIFICATE
- OTHER

#### Status do Documento:

- PENDING_VERIFICATION - Aguardando verificação
- VERIFIED - Verificado
- REJECTED - Rejeitado
- EXPIRED - Expirado

---

## 🔧 Serviços Auxiliares (Cross-cutting Concerns)

### 📧 SERVIÇO: Notificação `notification`

**Status:** ⏳ Pendente  
**Objetivo:** Sistema de notificações multi-canal

#### Canais:

- 📧 Email (SMTP)
- 💬 SMS (Twilio/AWS SNS)
- 🔔 Push Notifications (Firebase Cloud Messaging)
- 📱 In-App Notifications (WebSocket)

#### Eventos que disparam notificações:

```
✅ Novo usuário criado → Email de boas-vindas
✅ Nova requisição de serviço → Notificar prestador
✅ Prestador aceita requisição → Notificar contratante
✅ Serviço concluído → Solicitar review
✅ Novo review recebido → Notificar prestador
✅ Documento verificado/rejeitado → Notificar usuário
✅ Agendamento próximo → Lembrete (reminder)
✅ Usuário offline 24h → Reengagement
```

#### Queue: RabbitMQ

```
Topics:
- notification.email.*
- notification.sms.*
- notification.push.*
- notification.inapp.*
```

---

### 💾 SERVIÇO: Cache `cache`

**Status:** ⏳ Pendente  
**Objetivo:** Otimizar performance com cache distribuído

#### Dados em cache:

```
✅ Categorias (TTL: 24h) - /categories
✅ Serviços por categoria (TTL: 24h) - /categories/:id/services
✅ Perfil de prestador (TTL: 2h) - /providers/:id
✅ Avaliação média prestador (TTL: 1h) - /providers/:id/rating
✅ Preferências de usuário (TTL: 30min)
✅ Sessões autenticadas (TTL: 2h)
✅ Resultados de busca (TTL: 30min)
✅ Geolocalização (TTL: 1h)
```

#### Tecnologia: Redis

```
Padrões:
- Key: `cache:{entity}:{id}:{version}`
- TTL configurável por entidade
- Cache invalidation por evento
```

---

### ⏰ SERVIÇO: Agendador `cron`

**Status:** ⏳ Pendente  
**Objetivo:** Tarefas agendadas recorrentes

#### Tarefas Cron:

```
Diariamente 06:00:
  └─→ Enviar lembretes de serviço agendado (24h antes)

Diariamente 08:00:
  └─→ Atualizar disponibilidade de prestadores

Diariamente 10:00:
  └─→ Limpar requisições expiradas (> 30 dias)

Diariamente 20:00:
  └─→ Gerar relatório de atividades do dia

Semanalmente (Segunda 09:00):
  └─→ Limpar cache antigo
  └─→ Gerar relatório semanal

Mensalmente (1º dia 01:00):
  └─→ Arquivar dados antigos (> 1 ano)
  └─→ Reset de contadores
```

#### Tecnologia: Bull/NestJS Task Scheduler

---

### 📊 SERVIÇO: Analytics & Logging

**Status:** ⏳ Pendente  
**Objetivo:** Tracking de eventos e métricas

#### Eventos rastreados:

```
✅ Requisição de serviço criada
✅ Status de requisição alterado
✅ Review criado
✅ Usuário se registrou
✅ Prestador se registrou
✅ Documento verificado
✅ Erro de API
```

#### Tecnologia: DataDog/CloudWatch

```
Logs: Estruturados em JSON
Métricas: Prometheus/StatsD
Traces: Distributed tracing
```

---

### 📍 SERVIÇO: Geolocalização

**Status:** ⏳ Pendente  
**Objetivo:** Buscar prestadores próximos

#### Funcionalidades:

```
✅ Buscar prestadores por raio (km)
✅ Ordenar por distância
✅ Sugerir endereços (autocomplete)
✅ Calcular rota
```

#### Tecnologia: PostGIS + Google Maps API

---

## 📅 Ordem de Desenvolvimento (Fase 1)

### Semana 1: Estrutura Base

- [x] Migrations do BD
- [x] Keycloak configurado
- [ ] Módulo Auth com integração Keycloak
- [ ] Módulo Health Check
- [ ] Setup de testes (unit + e2e)

### Semana 2: Entidades Principais

- [ ] Módulo User (CRUD básico)
- [ ] Módulo Email
- [ ] Módulo Phone
- [ ] Módulo Address
- [ ] Testes e2e

### Semana 3: Serviços

- [ ] Módulo Category
- [ ] Módulo Service
- [ ] Módulo Provider
- [ ] Módulo Provider-Service

### Semana 4: Requisições & Reviews

- [ ] Módulo Service-Request
- [ ] Módulo Review
- [ ] Testes completos

### Semana 5: Serviços Auxiliares

- [ ] Módulo Document (verificação)
- [ ] Serviço Notification (email + SMS)
- [ ] Serviço Cache (Redis)
- [ ] Serviço Cron

### Semana 6: Otimizações

- [ ] Geolocalização
- [ ] Analytics & Logging
- [ ] Performance tuning
- [ ] Deploy preparation

---

## 🚀 Stack Tecnológico

### Backend Core

- **Runtime:** Node.js 20+
- **Framework:** NestJS (OOP + Clean Architecture)
- **Linguagem:** TypeScript

### Database

- **Primary:** PostgreSQL 18
- **Secondary:** MongoDB 7 (optional)
- **Cache:** Redis 7
- **Migrations:** TypeORM

### Authentication

- **OAuth2 Provider:** Keycloak 25
- **JWT Strategy:** Passport.js
- **Session:** Redis

### Message Queue

- **System:** RabbitMQ 3.9
- **Client:** @nestjs/rabbitmq

### Task Scheduler

- **Job Queue:** Bull + Bull Board
- **Cron:** @nestjs/schedule

### Testing

- **Framework:** Jest
- **E2E:** Supertest + TestContainers
- **Coverage:** >80%

### Monitoring & Logging

- **APM:** DataDog
- **Logs:** Centralized (File + Datadog)
- **Metrics:** Prometheus

### Deployment

- **Container:** Docker + Docker Compose
- **CI/CD:** GitLab CI ou GitHub Actions
- **Registry:** Docker Hub / ECR

---

## 📦 Estrutura de Diretórios Final

```
src/
├── config/                     # Configuração global
├── core/                       # Interceptors, guards, decorators
├── common/                     # DTOs, filters, interfaces compartilhadas
├── modules/
│   ├── auth/                   # Autenticação
│   │   ├── application/
│   │   │   └── use-cases/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   └── interfaces/
│   │   ├── infrastructure/
│   │   │   ├── repositories/
│   │   │   ├── services/
│   │   │   ├── providers/
│   │   │   └── controllers/
│   │   └── auth.module.ts
│   ├── user/                   # Usuários
│   ├── email/                  # Emails
│   ├── phone/                  # Phones
│   ├── address/                # Endereços
│   ├── provider/               # Perfil de prestadores
│   ├── category/               # Categorias de serviços
│   ├── service/                # Serviços
│   ├── provider-service/       # Serviços do prestador
│   ├── service-request/        # Requisições de serviço
│   ├── review/                 # Avaliações
│   ├── document/               # Documentos
│   ├── notification/           # Notificações
│   ├── email-service/          # Serviço de email
│   ├── sms-service/            # Serviço de SMS
│   ├── cache-service/          # Cache (Redis)
│   ├── cron-service/           # Tasks agendadas
│   ├── analytics/              # Analytics & Logging
│   └── shared/                 # Shared entre módulos
├── jobs/                       # Background jobs
├── scripts/                    # Scripts auxiliares
└── main.ts
```

---

## ✅ Checklist de Implementação

### Fase 1: MVP (API Base)

- [ ] Auth (Keycloak + JWT)
- [ ] User (CRUD)
- [ ] Provider (CRUD)
- [ ] Service (CRUD)
- [ ] Service-Request (CRUD + Status)
- [ ] Review (CREATE + GET)
- [ ] Notification (Email)

### Fase 2: Completude

- [ ] Cache (Redis)
- [ ] Phone/Email/Address (Multi CRUD)
- [ ] Document (Upload + Verification)
- [ ] Cron (Reminders)
- [ ] Analytics

### Fase 3: Produção

- [ ] Testes (E2E 100%)
- [ ] Performance (Índices, Queries)
- [ ] Security (CORS, Rate Limit, SQL Injection)
- [ ] Monitoring (DataDog, Logs)
- [ ] CI/CD Pipeline

---

## 🔗 Referências

- **DBML Schema:** `/diagramdb.dbml`
- **Migrations:** `src/modules/shared/infrastructure/providers/database/migrations/`
- **Arquivo de Escopo Original:** `.agents/skills/Escopo Sol. Domestica.pdf`
- **Arquitetura:** `docs/ARCHITECTURE.md`
