# 📋 Tarefas por Módulo - Domestic Backend API

## 🎯 Legenda de Prioridade

- 🔴 **CRITICAL** - Blocker, deve ser feito primeiro
- 🟠 **HIGH** - Muito importante, faz parte do MVP
- 🟡 **MEDIUM** - Importante, mas pode aguardar
- 🟢 **LOW** - Nice to have, adicional

---

## 📦 MÓDULO 1: Auth (Autenticação & Autorização)

**Prioridade:** 🔴 CRITICAL  
**Dependências:** Keycloak (já configurado)  
**Arquivo:** `src/modules/auth/`

### Sub-tarefas:

#### 🔴 1.1 - Setup de Guards e Strategies

- [ ] Criar `JwtAuthGuard` para validar tokens
- [ ] Integrar `JwtStrategy` com Keycloak
- [ ] Criar `RolesGuard` para autorização por roles
- [ ] Criar decorador `@Roles('admin', 'user')` customizado
- [ ] Criar decorador `@CurrentUser()` para injetar usuário autenticado
- [ ] Testes unitários dos guards

**Arquivos:**

- `src/core/guards/jwt-auth.guard.ts`
- `src/core/strategies/jwt.strategy.ts`
- `src/core/decorators/roles.decorator.ts`
- `src/core/decorators/current-user.decorator.ts`

#### 🟠 1.2 - Controllers

- [ ] Criar `/auth/login` (POST) **- Resource Owner Password Flow com Keycloak**
  - Input: { email, password }
  - Output: { access_token, refresh_token, expires_in, user }
  - Nota: Chama Keycloak para autenticar, NÃO valida localmente
- [ ] Criar `/auth/refresh` (POST)
  - Input: { refresh_token }
  - Output: { access_token, expires_in }
  - Nota: Chama Keycloak para renovar token
- [ ] Criar `/auth/me` (GET) - Usuário autenticado (requer JWT válido)
- [ ] Criar `/auth/logout` (POST) - Invalidar token em Redis
- [ ] Criar `/auth/register` (POST) - Criar conta no Keycloak
  - Input: { email, password, fullName }
  - Output: { userId, keycloakId, email }
  - Nota: Cria usuário no Keycloak E na BD local
- [ ] Criar `/auth/change-password` (POST) - Alterar senha
  - Input: { currentPassword, newPassword }
  - Nota: Delega ao Keycloak para validar e alterar
- [ ] Criar `/auth/forgot-password` (POST) - Solicitar reset de senha
  - Input: { email }
  - Nota: Keycloak envia email com link de reset
  - Output: { message, status }
- [ ] Criar `/auth/reset-password` (POST) - Reset com token
  - Input: { token, newPassword }
  - Nota: Valida token do Keycloak e reseta senha
- [ ] Criar erros customizados (UnauthorizedError, ForbiddenError, InvalidCredentialsError)

**Arquivo:** `src/modules/auth/auth.controller.ts`

#### 🟠 1.3 - Services

**Nota:** Todos os serviços devem usar a REST API do Keycloak, nunca armazenar passwords localmente

- [ ] `AuthService.loginWithKeycloak()` - Login via Resource Owner Password Flow
  - Chama: POST /auth/realms/domestic-backend/protocol/openid-connect/token
  - Retorna: { access_token, refresh_token, expires_in }
- [ ] `AuthService.refreshTokenWithKeycloak()` - Renovar token
  - Chama: POST /auth/realms/domestic-backend/protocol/openid-connect/token (com grant_type=refresh_token)
- [ ] `AuthService.validateToken()` - Validar JWT localmente
  - Decodificar JWT e validar assinatura
  - Verificar roles e permissões
  - Cache em Redis com TTL do token
- [ ] `AuthService.getRolesFromToken()` - Extrair roles do JWT
- [ ] `AuthService.getUserInfoFromToken()` - Extrair user info do JWT
- [ ] `AuthService.registerUserInKeycloak()` - Criar novo usuário no Keycloak
  - Chama: POST /admin/realms/domestic-backend/users
  - Requer: Admin credentials do Keycloak
- [ ] Integração com Redis para cache de tokens (TTL = expires_in do token)
- [ ] Error handling para respostas do Keycloak
- [ ] Testes unitários

**Arquivo:** `src/modules/auth/services/auth.infrastructure.service.ts`

#### 🟢 1.4 - DTOs

- [ ] `LoginDto` - { email, password }
  - @IsEmail(), @IsNotEmpty(), @MinLength(8)
- [ ] `RegisterDto` - { email, password, fullName, phone }
  - @IsEmail(), @IsNotEmpty(), @MinLength(8)
  - @IsString(), @IsNotEmpty() para fullName
- [ ] `RefreshTokenDto` - { refresh_token }
  - @IsNotEmpty()
- [ ] `TokenResponseDto` - { access_token, refresh_token, expires_in, token_type, user_id }
- [ ] `CurrentUserDto` - { id, email, fullName, keycloakId, roles, groups }
- [ ] Validações com `class-validator` e `class-transformer`

**Arquivo:** `src/modules/auth/dtos/`

#### 🟢 1.5 - Tests

- [ ] Testes unitários (85%+ coverage)
  - Mock das chamadas ao Keycloak
  - Teste de validação de JWT
  - Teste de cache em Redis
  - Teste de roles e permissões
- [ ] Testes e2e para login/logout/refresh
  - Usar usuários de teste do Keycloak
  - Validar tokens retornados
  - Teste de refresh token expirado
- [ ] Teste de autorização com @Roles() decorator
  - Endpoint protegido com admin
  - Endpoint protegido com provider
- [ ] Teste de error handling
  - Credenciais inválidas
  - Token expirado
  - Token inválido

**Arquivo:** `src/modules/auth/**/*.spec.ts`

---

## 📦 MÓDULO 2: User (Usuários)

**Prioridade:** 🟠 HIGH  
**Dependências:** Auth, Keycloak  
**Arquivo:** `src/modules/user/`

**⚠️ Nota Importante sobre Keycloak:**

- Todo usuário deve ter um `keycloak_id` sincronizado
- Quando um usuário é criado via Auth module, ele é criado no Keycloak E na BD local
- Não duplication de usuários permitida (email único em ambos os sistemas)
- Verificação de email deve ser feita via Keycloak quando possível

### Sub-tarefas:

#### 🟠 2.1 - Entidades e Repositories

- [ ] Criar `UserEntity` (TypeORM)
- [ ] Criar `UserRepository` com métodos:
  - `create(userData)`
  - `findById(id)`
  - `findByEmail(email)`
  - `findByKeycloakId(keycloakId)`
  - `update(id, data)`
  - `softDelete(id)` - Soft delete
  - `findAll(pagination, filters)`
- [ ] Criar índices para performance
- [ ] Testes de repository

**Arquivo:**

- `src/modules/user/entities/user.entity.ts`
- `src/modules/user/repositories/user.repository.ts`

#### 🟠 2.2 - Use Cases

- [ ] `CreateUserUseCase` - Criar usuário (com validações)
- [ ] `GetUserUseCase` - Obter dados do usuário
- [ ] `UpdateUserUseCase` - Atualizar perfil
- [ ] `DeleteUserUseCase` - Soft delete
- [ ] `ListUsersUseCase` - Listar com paginação e filtros
- [ ] `GetUserStatusUseCase` - Obter status
- [ ] `UpdateUserStatusUseCase` - Atualizar status

**Arquivo:** `src/modules/user/use-cases/`

#### 🟠 2.3 - Controllers

- [ ] `GET /users` - Listar (admin apenas)
- [ ] `GET /users/me` - Dados do usuário autenticado
- [ ] `GET /users/:id` - Obter usuário
- [ ] `PUT /users/:id` - Atualizar perfil
- [ ] `DELETE /users/:id` - Deletar
- [ ] `GET /users/:id/status` - Ver status
- [ ] `PUT /users/:id/status` - Atualizar status

**Arquivo:** `src/modules/user/user.controller.ts`

#### 🟡 2.4 - DTOs

- [ ] `CreateUserDto`
- [ ] `UpdateUserDto`
- [ ] `UserResponseDto`
- [ ] `UserListResponseDto` (com pagination)
- [ ] `UpdateUserStatusDto`

**Arquivo:** `src/modules/user/dtos/`

#### 🟢 2.5 - Testes

- [ ] Testes unitários (80%+ coverage)
- [ ] Testes e2e para CRUD
- [ ] Teste de soft delete
- [ ] Teste de filtros e paginação

**Arquivo:** `src/modules/user/**/*.spec.ts`

---

## 📦 MÓDULO 3: Email (Emails do Usuário)

**Prioridade:** 🟠 HIGH  
**Dependências:** User  
**Arquivo:** `src/modules/email/`

### Sub-tarefas:

#### 🟠 3.1 - Entidades e Repositories

- [ ] Criar `EmailEntity` (compartilhado)
- [ ] Criar `UserEmailEntity` (M2M)
- [ ] Criar `UserEmailRepository` com métodos:
  - `create(userId, emailId, label, isPrimary)`
  - `findByUserId(userId)` - Listar todos emails do usuário
  - `findPrimaryEmail(userId)` - Email primário
  - `update(id, data)`
  - `delete(id)`
  - `markAsPrimary(id)`
  - `markAsVerified(id)`
- [ ] Criar índices

**Arquivo:**

- `src/modules/email/entities/`
- `src/modules/email/repositories/`

#### 🟠 3.2 - Use Cases

- [ ] `AddEmailUseCase` - Adicionar email ao usuário
- [ ] `RemoveEmailUseCase` - Remover email
- [ ] `UpdateEmailUseCase` - Atualizar label
- [ ] `ListUserEmailsUseCase` - Listar emails do usuário
- [ ] `MarkEmailAsPrimaryUseCase` - Definir primário
- [ ] `MarkEmailAsVerifiedUseCase` - Marcar como verificado

**Arquivo:** `src/modules/email/use-cases/`

#### 🟠 3.3 - Controllers

- [ ] `GET /users/:userId/emails` - Listar
- [ ] `POST /users/:userId/emails` - Adicionar
- [ ] `PUT /users/:userId/emails/:emailId` - Atualizar
- [ ] `DELETE /users/:userId/emails/:emailId` - Remover
- [ ] `PUT /users/:userId/emails/:emailId/primary` - Definir primário
- [ ] `PUT /users/:userId/emails/:emailId/verify` - Marcar verificado

**Arquivo:** `src/modules/email/email.controller.ts`

#### 🟡 3.4 - DTOs & Validações

- [ ] `CreateEmailDto` - { email, label, isPrimary }
- [ ] `UpdateEmailDto` - { label }
- [ ] `EmailResponseDto`
- [ ] Validação de email único por usuário
- [ ] Validação de email válido (regex)

**Arquivo:** `src/modules/email/dtos/`

#### 🟢 3.5 - Testes

- [ ] Testes unitários
- [ ] Testes e2e
- [ ] Teste de email duplicado
- [ ] Teste de email primário único

---

## 📦 MÓDULO 4: Phone (Telefones do Usuário)

**Prioridade:** 🟠 HIGH  
**Dependências:** User  
**Arquivo:** `src/modules/phone/`  
**Status:** ⏳ Em construção (já existe)

### Sub-tarefas:

#### 🟠 4.1 - Expandir Entidades

- [ ] Atualizar `PhoneEntity` com `type` (MOBILE, LANDLINE, WHATSAPP)
- [ ] Criar `UserPhoneEntity` (M2M)
- [ ] Criar `ProviderPhoneEntity` (não faz parte deste módulo, mas compartilha estrutura)
- [ ] Testes de schema

**Arquivo:** `src/modules/phone/entities/`

#### 🟠 4.2 - Repositories

- [ ] `UserPhoneRepository` com métodos:
  - `create(userId, phoneId, label, isPrimary)`
  - `findByUserId(userId)`
  - `findByPhoneNumber(number)` - Validar duplicação
  - `update(id, data)`
  - `delete(id)`
  - `markAsPrimary(id)`
  - `markAsVerified(id)`

**Arquivo:** `src/modules/phone/repositories/user-phone.repository.ts`

#### 🟠 4.3 - Use Cases

- [ ] `AddPhoneUseCase`
- [ ] `RemovePhoneUseCase`
- [ ] `ListUserPhonesUseCase`
- [ ] `MarkPhoneAsPrimaryUseCase`
- [ ] `MarkPhoneAsVerifiedUseCase`
- [ ] `SendOtpUseCase` - Enviar OTP para verificação via SMS
- [ ] `VerifyOtpUseCase` - Verificar OTP

**Arquivo:** `src/modules/phone/use-cases/`

#### 🟠 4.4 - Controllers

- [ ] `GET /users/:userId/phones` - Listar
- [ ] `POST /users/:userId/phones` - Adicionar
- [ ] `PUT /users/:userId/phones/:phoneId` - Atualizar
- [ ] `DELETE /users/:userId/phones/:phoneId` - Remover
- [ ] `PUT /users/:userId/phones/:phoneId/primary` - Primário
- [ ] `PUT /users/:userId/phones/:phoneId/verify` - Marcar verificado
- [ ] `POST /users/:userId/phones/:phoneId/send-otp` - Enviar OTP
- [ ] `POST /users/:userId/phones/:phoneId/verify-otp` - Verificar OTP

**Arquivo:** `src/modules/phone/phone.controller.ts`

#### 🟡 4.5 - DTOs

- [ ] `CreatePhoneDto` - { number, type, label, isPrimary }
- [ ] `SendOtpDto` - {}
- [ ] `VerifyOtpDto` - { code }
- [ ] Validação de formato de telefone

**Arquivo:** `src/modules/phone/dtos/`

#### 🟢 4.6 - Testes

- [ ] Testes unitários
- [ ] Testes e2e
- [ ] Testes de OTP

---

## 📦 MÓDULO 5: Address (Endereços)

**Prioridade:** 🟠 HIGH  
**Dependências:** User  
**Arquivo:** `src/modules/address/`  
**Status:** ⏳ Em construção (já existe)

### Sub-tarefas:

#### 🟠 5.1 - Entidades

- [ ] Atualizar `AddressEntity` com `latitude`, `longitude`, `country`
- [ ] Criar `UserAddressEntity` (M2M) com `type` (RESIDENTIAL, COMMERCIAL, etc)
- [ ] Criar índices para busca por localização

**Arquivo:** `src/modules/address/entities/`

#### 🟠 5.2 - Repositories

- [ ] `UserAddressRepository` com métodos:
  - `create(userId, addressId, label, type, isPrimary)`
  - `findByUserId(userId)`
  - `findPrimaryAddress(userId)`
  - `findNearbyAddresses(lat, lng, radius)` - Busca por raio (PostGIS)
  - `update(id, data)`
  - `delete(id)`
  - `markAsPrimary(id)`

**Arquivo:** `src/modules/address/repositories/user-address.repository.ts`

#### 🟠 5.3 - Use Cases

- [ ] `AddAddressUseCase`
- [ ] `RemoveAddressUseCase`
- [ ] `ListUserAddressesUseCase`
- [ ] `UpdateAddressUseCase`
- [ ] `MarkAddressAsPrimaryUseCase`
- [ ] `FindNearbyAddressesUseCase` - Busca por localização

**Arquivo:** `src/modules/address/use-cases/`

#### 🟠 5.4 - Controllers

- [ ] `GET /users/:userId/addresses` - Listar
- [ ] `POST /users/:userId/addresses` - Adicionar
- [ ] `PUT /users/:userId/addresses/:addressId` - Atualizar
- [ ] `DELETE /users/:userId/addresses/:addressId` - Remover
- [ ] `GET /addresses/nearby?lat=X&lng=Y&radius=Z` - Buscar próximos
- [ ] `PUT /users/:userId/addresses/:addressId/primary` - Primário
- [ ] `GET /users/:userId/addresses/:addressId/verify` - Solicitar verificação
- [ ] `PUT /users/:userId/addresses/:addressId/verify` - Marcar verificado

**Arquivo:** `src/modules/address/address.controller.ts`

#### 🟡 5.5 - DTOs

- [ ] `CreateAddressDto` - Ender completo com lat/lng
- [ ] `UpdateAddressDto` - Partial update
- [ ] `NearbyAddressesQueryDto` - { lat, lng, radiusKm }
- [ ] Validação de coordenadas
- [ ] Geocoding integration (opcional)

**Arquivo:** `src/modules/address/dtos/`

#### 🟢 5.6 - Testes

- [ ] Testes unitários
- [ ] Testes e2e
- [ ] Testes de geolocalização (mock PostGIS)

---

## 📦 MÓDULO 6: Provider (Perfil de Prestador)

**Prioridade:** 🟠 HIGH  
**Dependências:** User, Email, Phone, Address  
**Arquivo:** `src/modules/provider/`

### Sub-tarefas:

#### 🟠 6.1 - Entidades

- [ ] Criar `ProviderProfileEntity` com:
  - `userId` (FK -> User, único)
  - `businessName`
  - `description`
  - `averageRating` (0.0 - 5.0)
  - `isAvailable` (boolean)
- [ ] Criar índices

**Arquivo:** `src/modules/provider/entities/provider-profile.entity.ts`

#### 🟠 6.2 - Repositories

- [ ] `ProviderProfileRepository` com métodos:
  - `create(userId, data)`
  - `findById(id)`
  - `findByUserId(userId)`
  - `findAll(filters, pagination)` - Com search, rating, availability
  - `update(id, data)`
  - `delete(id)` - Soft delete
  - `findAvailable()` - Prestadores disponíveis
  - `updateRating(providerId, newRating)`

**Arquivo:** `src/modules/provider/repositories/provider-profile.repository.ts`

#### 🟠 6.3 - Use Cases

- [ ] `CreateProviderProfileUseCase`
- [ ] `GetProviderProfileUseCase`
- [ ] `UpdateProviderProfileUseCase`
- [ ] `DeleteProviderProfileUseCase`
- [ ] `ListProvidersUseCase` - Com filtros (nome, rating, serviço)
- [ ] `GetProviderRatingUseCase` - Avaliação média
- [ ] `UpdateProviderAvailabilityUseCase`
- [ ] `SearchProvidersByServiceUseCase`

**Arquivo:** `src/modules/provider/use-cases/`

#### 🟠 6.4 - Controllers

- [ ] `GET /providers` - Listar (com filtros)
- [ ] `GET /providers/:id` - Obter detalhes
- [ ] `POST /users/:userId/provider-profile` - Criar perfil
- [ ] `PUT /providers/:id` - Atualizar
- [ ] `DELETE /providers/:id` - Deletar
- [ ] `GET /providers/:id/rating` - Avaliação média
- [ ] `PUT /providers/:id/availability` - Disponibilidade
- [ ] `GET /providers/search?query=...` - Busca por nome
- [ ] `GET /providers/:id/reviews` - Listar reviews
- [ ] `GET /providers/:id/review-stats` - Estatísticas

**Arquivo:** `src/modules/provider/provider.controller.ts`

#### 🟡 6.5 - DTOs

- [ ] `CreateProviderProfileDto`
- [ ] `UpdateProviderProfileDto`
- [ ] `ProviderResponseDto`
- [ ] `ProviderListResponseDto`
- [ ] `ProviderSearchQueryDto`

**Arquivo:** `src/modules/provider/dtos/`

#### 🟢 6.6 - Testes

- [ ] Testes unitários
- [ ] Testes e2e
- [ ] Testes de filtros e busca
- [ ] Testes de atualização de rating

---

## 📦 MÓDULO 7: Category (Categorias de Serviços)

**Prioridade:** 🟠 HIGH  
**Dependências:** Nenhum módulo (independente)  
**Arquivo:** `src/modules/category/`

### Sub-tarefas:

#### 🟠 7.1 - Entidades & Repository

- [ ] Criar `CategoryEntity`
- [ ] Criar `CategoryRepository` com métodos:
  - `create(data)`
  - `findById(id)`
  - `findAll()`
  - `findBySlug(slug)`
  - `update(id, data)`
  - `delete(id)` - Soft delete
- [ ] Testes

**Arquivo:**

- `src/modules/category/entities/category.entity.ts`
- `src/modules/category/repositories/category.repository.ts`

#### 🟠 7.2 - Use Cases (simples)

- [ ] `CreateCategoryUseCase` - Admin only
- [ ] `GetCategoryUseCase`
- [ ] `ListCategoriesUseCase` - Com cache
- [ ] `UpdateCategoryUseCase` - Admin only
- [ ] `DeleteCategoryUseCase` - Admin only

**Arquivo:** `src/modules/category/use-cases/`

#### 🟠 7.3 - Controllers

- [ ] `GET /categories` - Listar (cached)
- [ ] `GET /categories/:id` - Obter
- [ ] `POST /categories` - Criar (admin)
- [ ] `PUT /categories/:id` - Atualizar (admin)
- [ ] `DELETE /categories/:id` - Deletar (admin)
- [ ] `GET /categories/:id/services` - Serviços da categoria

**Arquivo:** `src/modules/category/category.controller.ts`

#### 🟡 7.4 - DTOs

- [ ] `CreateCategoryDto` - { name, slug, iconUrl }
- [ ] `UpdateCategoryDto`
- [ ] `CategoryResponseDto`

**Arquivo:** `src/modules/category/dtos/`

#### 🟢 7.5 - Testes

- [ ] Testes unitários
- [ ] Testes e2e
- [ ] Testes de cache

---

## 📦 MÓDULO 8: Service (Serviços)

**Prioridade:** 🟠 HIGH  
**Dependências:** Category  
**Arquivo:** `src/modules/service/`

### Sub-tarefas:

#### 🟠 8.1 - Entidades & Repository

- [ ] Criar `ServiceEntity`
- [ ] Criar `ServiceRepository` com métodos:
  - `create(categoryId, data)`
  - `findById(id)`
  - `findByCategoryId(categoryId)`
  - `findAll()`
  - `findByName(name)` - Busca
  - `update(id, data)`
  - `delete(id)` - Soft delete

**Arquivo:**

- `src/modules/service/entities/service.entity.ts`
- `src/modules/service/repositories/service.repository.ts`

#### 🟠 8.2 - Use Cases

- [ ] `CreateServiceUseCase` - Admin only
- [ ] `GetServiceUseCase`
- [ ] `ListServicesByCategoryUseCase` - Com cache
- [ ] `ListAllServicesUseCase` - Com cache
- [ ] `UpdateServiceUseCase` - Admin only
- [ ] `DeleteServiceUseCase` - Admin only
- [ ] `SearchServicesUseCase` - By name

**Arquivo:** `src/modules/service/use-cases/`

#### 🟠 8.3 - Controllers

- [ ] `GET /services` - Listar (cached)
- [ ] `GET /services/:id` - Obter
- [ ] `GET /categories/:categoryId/services` - Por categoria
- [ ] `POST /categories/:categoryId/services` - Criar (admin)
- [ ] `PUT /services/:id` - Atualizar (admin)
- [ ] `DELETE /services/:id` - Deletar (admin)
- [ ] `GET /services/search?query=` - Buscar
- [ ] `GET /services/:id/providers` - Prestadores que oferecem

**Arquivo:** `src/modules/service/service.controller.ts`

#### 🟡 8.4 - DTOs

- [ ] `CreateServiceDto` - { name, description }
- [ ] `UpdateServiceDto`
- [ ] `ServiceResponseDto`
- [ ] `ServiceSearchQueryDto`

**Arquivo:** `src/modules/service/dtos/`

#### 🟢 8.5 - Testes

- [ ] Testes unitários
- [ ] Testes e2e
- [ ] Testes de cache

---

## 📦 MÓDULO 9: ProviderService (Serviços do Prestador)

**Prioridade:** 🟠 HIGH  
**Dependências:** Provider, Service  
**Arquivo:** `src/modules/provider-service/`

### Sub-tarefas:

#### 🟠 9.1 - Entidades & Repository

- [ ] Criar `ProviderServiceEntity` com preço e tipo
- [ ] Criar `ProviderServiceRepository` com métodos:
  - `create(providerId, serviceId, data)`
  - `findById(id)`
  - `findByProviderId(providerId)`
  - `findByServiceId(serviceId)` - Todos prestadores do serviço
  - `update(id, data)`
  - `delete(id)`
  - `findByProviderAndService(providerId, serviceId)`

**Arquivo:**

- `src/modules/provider-service/entities/provider-service.entity.ts`
- `src/modules/provider-service/repositories/provider-service.repository.ts`

#### 🟠 9.2 - Use Cases

- [ ] `AddServiceToProviderUseCase` - Prestador add serviço
- [ ] `RemoveServiceFromProviderUseCase`
- [ ] `ListProviderServicesUseCase`
- [ ] `UpdateProviderServicePriceUseCase`
- [ ] `GetServiceProvidersUseCase` - Prestadores que oferecem X serviço

**Arquivo:** `src/modules/provider-service/use-cases/`

#### 🟠 9.3 - Controllers

- [ ] `GET /providers/:providerId/services` - Listar
- [ ] `POST /providers/:providerId/services` - Adicionar
- [ ] `PUT /providers/:providerId/services/:serviceId` - Atualizar preço
- [ ] `DELETE /providers/:providerId/services/:serviceId` - Remover
- [ ] `GET /providers/:providerId/services/:serviceId` - Detalhe
- [ ] `GET /services/:serviceId/providers` - Prestadores que oferecem

**Arquivo:** `src/modules/provider-service/provider-service.controller.ts`

#### 🟡 9.4 - DTOs

- [ ] `CreateProviderServiceDto` - { serviceId, priceBase, priceType }
- [ ] `UpdateProviderServiceDto` - { priceBase, priceType }
- [ ] `ProviderServiceResponseDto`
- [ ] Validação de preço > 0

**Arquivo:** `src/modules/provider-service/dtos/`

#### 🟢 9.5 - Testes

- [ ] Testes unitários
- [ ] Testes e2e
- [ ] Testes de validação de preço

---

## 📦 MÓDULO 10: ServiceRequest (Requisições de Serviço)

**Prioridade:** 🟠 HIGH  
**Dependências:** User, Provider, Service, Address  
**Arquivo:** `src/modules/service-request/`

### Sub-tarefas:

#### 🟠 10.1 - Entidades & Repository

- [ ] Criar `ServiceRequestEntity` com status e confirmações
- [ ] Criar `ServiceRequestRepository` com métodos:
  - `create(data)`
  - `findById(id)`
  - `findByContractorId(userId)` - Requisições do contratante
  - `findByProviderId(providerId)` - Requisições para o prestador
  - `findAll(filters, pagination)` - Admin
  - `update(id, data)`
  - `updateStatus(id, status)`
  - `delete(id)` - Soft delete
  - `findByStatus(status)` - Todas requisições em status X

**Arquivo:**

- `src/modules/service-request/entities/service-request.entity.ts`
- `src/modules/service-request/repositories/service-request.repository.ts`

#### 🟠 10.2 - Use Cases

- [ ] `CreateServiceRequestUseCase` - Contratante cria requisição
- [ ] `AcceptServiceRequestUseCase` - Prestador aceita
- [ ] `RejectServiceRequestUseCase` - Prestador rejeita
- [ ] `ConfirmServiceRequestUseCase` - Ambos confirmam
- [ ] `CompleteServiceRequestUseCase` - Marcar como concluído
- [ ] `CancelServiceRequestUseCase` - Cancelar requisição
- [ ] `ListServiceRequestsUseCase` - Do usuário autenticado
- [ ] `GetServiceRequestDetailsUseCase`
- [ ] `UpdateServiceRequestStatusUseCase`

**Arquivo:** `src/modules/service-request/use-cases/`

#### 🟠 10.3 - Controllers

- [ ] `GET /service-requests` - Listar (próprias do usuário)
- [ ] `GET /service-requests/:id` - Detalhe
- [ ] `POST /service-requests` - Criar
- [ ] `PUT /service-requests/:id` - Atualizar
- [ ] `DELETE /service-requests/:id` - Cancelar
- [ ] `PUT /service-requests/:id/status` - Mudar status
- [ ] `PUT /service-requests/:id/confirm-contractor` - Contratante confirma
- [ ] `PUT /service-requests/:id/confirm-provider` - Prestador confirma
- [ ] `GET /service-requests/:id/history` - Histórico de mudanças
- [ ] `POST /service-requests/:id/messages` - Adicionar mensagem
- [ ] `GET /service-requests/:id/messages` - Listar mensagens

**Arquivo:** `src/modules/service-request/service-request.controller.ts`

#### 🟡 10.4 - DTOs

- [ ] `CreateServiceRequestDto` - { providerId, serviceId, addressId, description, scheduledAt }
- [ ] `UpdateServiceRequestDto`
- [ ] `StatusChangeDto` - { status, reason }
- [ ] `ServiceRequestResponseDto`
- [ ] Validação de datas (scheduledAt > now)

**Arquivo:** `src/modules/service-request/dtos/`

#### 🟢 10.5 - Testes

- [ ] Testes unitários
- [ ] Testes e2e
- [ ] Testes de fluxo de status
- [ ] Testes de autorização

---

## 📦 MÓDULO 11: Review (Avaliações)

**Prioridade:** 🟠 HIGH  
**Dependências:** ServiceRequest, User, Provider  
**Arquivo:** `src/modules/review/`

### Sub-tarefas:

#### 🟠 11.1 - Entidades & Repository

- [ ] Criar `ReviewEntity` com rating e comment
- [ ] Criar `ReviewRepository` com métodos:
  - `create(data)`
  - `findById(id)`
  - `findByServiceRequestId(requestId)` - Único
  - `findByProviderId(providerId)` - Todas reviews do prestador
  - `findByContractorId(contractorId)`
  - `update(id, data)`
  - `delete(id)` - Soft delete
  - `getProviderAverageRating(providerId)` - Rating médio

**Arquivo:**

- `src/modules/review/entities/review.entity.ts`
- `src/modules/review/repositories/review.repository.ts`

#### 🟠 11.2 - Use Cases

- [ ] `CreateReviewUseCase` - Criar avaliação
- [ ] `GetReviewUseCase` - Obter review
- [ ] `UpdateReviewUseCase` - Atualizar review
- [ ] `DeleteReviewUseCase` - Deletar review
- [ ] `ListProviderReviewsUseCase` - Reviews do prestador
- [ ] `GetProviderReviewStatsUseCase` - Stats (média, count, distribuição)

**Arquivo:** `src/modules/review/use-cases/`

#### 🟠 11.3 - Controllers

- [ ] `GET /service-requests/:requestId/review` - Obter
- [ ] `POST /service-requests/:requestId/review` - Criar
- [ ] `PUT /service-requests/:requestId/review` - Atualizar
- [ ] `DELETE /service-requests/:requestId/review` - Deletar
- [ ] `GET /providers/:providerId/reviews` - Listar reviews do prestador
- [ ] `GET /providers/:providerId/review-stats` - Estatísticas

**Arquivo:** `src/modules/review/review.controller.ts`

#### 🟡 11.4 - DTOs

- [ ] `CreateReviewDto` - { rating, comment }
- [ ] `UpdateReviewDto` - { rating, comment }
- [ ] `ReviewResponseDto`
- [ ] `ReviewStatsDto` - { averageRating, totalReviews, distribution }
- [ ] Validação de rating (1-5)

**Arquivo:** `src/modules/review/dtos/`

#### 🟢 11.5 - Testes

- [ ] Testes unitários
- [ ] Testes e2e
- [ ] Testes de cálculo de média de rating
- [ ] Testes de autorização

---

## 📦 MÓDULO 12: Document (Documentos & Verificação)

**Prioridade:** 🟡 MEDIUM  
**Dependências:** User  
**Arquivo:** `src/modules/document/`

### Sub-tarefas:

#### 🟡 12.1 - Entidades & Repository

- [ ] Criar `DocumentEntity` com tipo e status
- [ ] Criar `DocumentRepository` com métodos:
  - `create(data)`
  - `findById(id)`
  - `findByUserId(userId)`
  - `findByUserAndType(userId, documentType)` - Único por tipo
  - `findByStatus(status)` - Documentos pendentes (admin)
  - `update(id, data)`
  - `delete(id)`

**Arquivo:**

- `src/modules/document/entities/document.entity.ts`
- `src/modules/document/repositories/document.repository.ts`

#### 🟡 12.2 - Use Cases

- [ ] `UploadDocumentUseCase` - Upload de arquivo
  - Validar tipo de arquivo
  - Validar tamanho máximo
  - Salvar em storage (AWS S3 ou local)
- [ ] `GetDocumentUseCase`
- [ ] `ListUserDocumentsUseCase`
- [ ] `DeleteDocumentUseCase`
- [ ] `VerifyDocumentUseCase` - Admin verifica documento
- [ ] `ListPendingDocumentsUseCase` - Admin vê pendentes

**Arquivo:** `src/modules/document/use-cases/`

#### 🟡 12.3 - Controllers

- [ ] `GET /users/:userId/documents` - Listar
- [ ] `GET /users/:userId/documents/:id` - Obter (download)
- [ ] `POST /users/:userId/documents` - Upload
- [ ] `PUT /users/:userId/documents/:id` - Atualizar
- [ ] `DELETE /users/:userId/documents/:id` - Deletar
- [ ] `PUT /users/:userId/documents/:id/verify` - Admin verifica
- [ ] `GET /documents/pending` - Admin vê pendentes

**Arquivo:** `src/modules/document/document.controller.ts`

#### 🟡 12.4 - DTOs

- [ ] `UploadDocumentDto` - { type, file (multipart) }
- [ ] `VerifyDocumentDto` - { status, rejectionReason }
- [ ] `DocumentResponseDto`
- [ ] `PendingDocumentDto`

**Arquivo:** `src/modules/document/dtos/`

#### 🟢 12.5 - Services

- [ ] `FileStorageService` - Salvar/recuperar arquivos
  - Suportar AWS S3 ou local
  - Generate signed URL para download
  - Validar tipo MIME
  - Validar tamanho

**Arquivo:** `src/modules/document/services/file-storage.service.ts`

#### 🟢 12.6 - Testes

- [ ] Testes unitários
- [ ] Testes e2e
- [ ] Testes de upload (mock S3)

---

## 📦 MÓDULO AUXILIAR 1: Notification (Notificações)

**Prioridade:** 🟡 MEDIUM  
**Dependências:** User, ServiceRequest  
**Arquivo:** `src/modules/notification/`

### Sub-tarefas:

#### 🟡 N1.1 - Serviço de Email

**⚠️ Nota sobre Keycloak:** Verificação de email e reset de senha são gerenciados pelo Keycloak. Este serviço é para notificações de aplicação apenas.

- [ ] Criar `EmailService` com métodos:
  - `sendWelcomeEmail(user)` - Novo usuário (após sucesso no Keycloak)
  - `sendServiceRequestNotification(provider, request)` - Nova requisição
  - `sendReviewNotification(provider, review)` - Nova avaliação
  - `sendStatusUpdateNotification(user, request)` - Atualização de status
  - `sendAppointmentReminder(user, appointment)` - Lembrete de agendamento
- [ ] Integrar com SMTP (SendGrid ou Nodemailer)
- [ ] Criar templates de email (HTML)
- [ ] Não armazenar nem gerenciar verificação de email (Keycloak faz isso)

**Arquivo:** `src/modules/notification/services/email.service.ts`

#### 🟡 N1.2 - Serviço de SMS (Twilio)

- [ ] Criar `SmsService` com métodos:
  - `sendOtp(phone, code)` - Enviar OTP
  - `sendAppointmentReminder(phone, appointment)` - Lembrete
  - `sendStatusUpdate(phone, request)` - Atualização de status
- [ ] Integrar com Twilio

**Arquivo:** `src/modules/notification/services/sms.service.ts`

#### 🟡 N1.3 - Serviço de Push Notifications

- [ ] Integrar Firebase Cloud Messaging
- [ ] Criar topics por tipo de notificação
- [ ] Enviar notificações para app mobile

**Arquivo:** `src/modules/notification/services/push.service.ts`

#### 🟡 N1.4 - Queue de Notificações (RabbitMQ)

- [ ] Criar consumers para:
  - `notification.email.*` - Email assíncrono
  - `notification.sms.*` - SMS assíncrono
  - `notification.push.*` - Push assíncrono
- [ ] Retry logic para falhas
- [ ] Dead letter queue para mensagens não processadas

**Arquivo:** `src/modules/notification/queues/notification.consumer.ts`

#### 🟡 N1.5 - Event Listeners

- [ ] Listener para eventos de criação/atualização
  - On `UserCreated` → Enviar welcome email
  - On `ServiceRequestCreated` → Notificar prestador
  - On `ServiceRequestAccepted` → Notificar contratante
  - On `ReviewCreated` → Notificar prestador
- [ ] Use EventEmitter do NestJS

**Arquivo:** `src/modules/notification/listeners/`

#### 🟢 N1.6 - DTOs e Testes

- [ ] DTOs para notificações
- [ ] Testes unitários
- [ ] Testes de integração com queue

---

## 📦 MÓDULO AUXILIAR 2: Cache Service

**Prioridade:** 🟡 MEDIUM  
**Dependências:** Redis  
**Arquivo:** `src/modules/cache-service/`

### Sub-tarefas:

#### 🟡 C1.1 - Cache Manager Service

- [ ] Criar `CacheService` com métodos:
  - `set(key, value, ttl)` - Armazenar
  - `get(key)` - Recuperar
  - `delete(key)` - Deletar
  - `clear(pattern)` - Deletar por padrão
  - `invalidate(entity, id)` - Invalidar por entidade
- [ ] Usar `@nestjs/cache-manager`

**Arquivo:** `src/modules/cache-service/cache.service.ts`

#### 🟡 C1.2 - Cache Decorators

- [ ] Criar decorador `@CacheTTL(key, ttl)`
  - Para GET /categories (24h)
  - Para GET /services (24h)
  - Para GET /providers/:id (2h)
- [ ] Criar decorador `@InvalidateCache(pattern)`
  - Para PUT /categories/:id (invalida category:\*)
  - Para DELETE /services/:id

**Arquivo:** `src/core/decorators/cache.decorator.ts`

#### 🟡 C1.3 - Cache Invalidation

- [ ] Sistema de event-based invalidation
  - On `CategoryUpdated` → Invalidar categories:\*
  - On `ServiceCreated` → Invalidar services:\*
  - On `ProviderUpdated` → Invalidar provider:{id}
- [ ] Usar EventEmitter

**Arquivo:** `src/modules/cache-service/cache-invalidation.listener.ts`

#### 🟢 C1.4 - Monitor de Cache

- [ ] Criar endpoint para admin:
  - `GET /admin/cache/stats` - Estatísticas de cache
  - `DELETE /admin/cache/clear` - Limpar cache
- [ ] Logs de hit/miss ratio

#### 🟢 C1.5 - Testes

- [ ] Testes unitários
- [ ] Testes de TTL
- [ ] Testes de invalidação

---

## 📦 MÓDULO AUXILIAR 3: Cron Service

**Prioridade:** 🟡 MEDIUM  
**Dependências:** ServiceRequest, Notification  
**Arquivo:** `src/modules/cron-service/`

### Sub-tarefas:

#### 🟡 CR1.1 - Task Scheduler Setup

- [ ] Usar `@nestjs/schedule` + Bull
- [ ] Criar `CronService` base
- [ ] Configurar timezone

**Arquivo:** `src/modules/cron-service/cron.service.ts`

#### 🟡 CR1.2 - Scheduled Tasks

- [ ] **06:00 todos os dias:** Enviar lembretes de serviço (24h antes)
  - Buscar requisições agendadas para amanhã
  - Enviar notificação para ambos (contratante + prestador)
- [ ] **08:00 todos os dias:** Atualizar disponibilidade de prestadores
  - Resetar contador de requisições do dia
  - Validar perfis que expiram

- [ ] **10:00 todos os dias:** Limpar requisições expiradas
  - Deletar requisições > 30 dias status PENDING
  - Liberar slots de prestadores

- [ ] **20:00 todos os dias:** Gerar relatório diário
  - Contar requisições por status
  - Contar novos usuários
  - Contar reviews

- [ ] **09:00 segunda-feira:** Cleanup semanal
  - Limpar cache antigo
  - Reset de counters

- [ ] **01:00 1º do mês:** Cleanup mensal
  - Arquivar dados > 1 ano
  - Reset de estatísticas

**Arquivo:** `src/modules/cron-service/tasks/`

#### 🟡 CR1.3 - Task Monitoring

- [ ] Criar dashboard de tarefas agendadas
- [ ] Log de execução (sucesso/falha)
- [ ] Retry logic para falhas
- [ ] Dead letter queue para erro

**Arquivo:** `src/modules/cron-service/cron-monitor.service.ts`

#### 🟢 CR1.4 - DTOs

- [ ] `TaskExecutionDto` - Resultado da execução

#### 🟢 CR1.5 - Testes

- [ ] Testes unitários
- [ ] Mock de data para testar agendamento

---

## 📋 Resumo de Prioridades

### 🔴 CRITICAL (Semana 1)

- [ ] Auth Module com Keycloak
- [ ] User CRUD básico
- [ ] Setup de testes
- [ ] Health check

### 🟠 HIGH (Semana 2-3)

- [ ] Email, Phone, Address (M2M)
- [ ] Provider perfil
- [ ] Category e Service
- [ ] Provider-Service
- [ ] Service-Request
- [ ] Review

### 🟡 MEDIUM (Semana 4-5)

- [ ] Document upload & verification
- [ ] Notification service
- [ ] Cache (Redis)
- [ ] Cron tasks

### 🟢 LOW (Pós-MVP)

- [ ] Geolocalização avançada
- [ ] Analytics & Reporting
- [ ] Admin dashboard
- [ ] Mobile app support

---

## 📊 Métricas de Sucesso

✅ **Cobertura de testes:** >80% unitários, >60% e2e  
✅ **API endpoints:** Todas com documentação Swagger  
✅ **Performance:** < 200ms para 95% das requisições  
✅ **Disponibilidade:** >99.5% uptime (com cache)  
✅ **Segurança:** Todas routes protegidas com autenticação
