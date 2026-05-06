# Referência de Credenciais - Projetos Domestic

Documentação centralizada de todas as credenciais e usuários dos projetos.

## Banco de Dados PostgreSQL

**Host Local:** `localhost:5432`  
**Host Kubernetes:** `postgres:5432`  
**Banco Principal:** `backend_database_postgres`

### Usuários

| Aplicação | Usuário | Senha | Permissões |
|-----------|---------|-------|-----------|
| API | `domestic_api` | `backendapi123` | Completo em backend_database_postgres |
| Worker | `domestic_worker` | `backendapi123` | Completo em backend_database_postgres |
| Cron | `domestic_cron` | `backendapi123` | Completo em backend_database_postgres |
| Admin | `domestic` | `postgres1234` | Superuser (uso interno apenas) |

### Variáveis de Ambiente

```env
DATABASE_POSTGRES_HOST=postgres
DATABASE_POSTGRES_PORT=5432
DATABASE_POSTGRES_NAME=backend_database_postgres
DATABASE_POSTGRES_USER=domestic_api  # ou domestic_worker, domestic_cron
DATABASE_POSTGRES_PASSWORD=backendapi123
```

---

## RabbitMQ

**Host Local:** `localhost:5672`  
**Host Kubernetes:** `rabbitmq:5672`  
**Management UI:** `http://rabbitmq:15672`  
**Default VHost:** `/`

### Usuários

| Aplicação | Usuário | Senha | Permissões |
|-----------|---------|-------|-----------|
| API | `domestic_api` | `backendapi123` | Leitura/Escrita no vhost `/` |
| Worker | `domestic_worker` | `backendapi123` | Leitura/Escrita no vhost `/` |
| Cron | `domestic_cron` | `backendapi123` | Leitura/Escrita no vhost `/` |
| Admin | `domestic` | `backendapi123` | Administrator (uso interno) |

### Variáveis de Ambiente

```env
# Versão com URI (recomendado)
RABBITMQ_URL=amqp://domestic_api:backendapi123@rabbitmq:5672/

# Ou separado
QUEUE_RABBITMQ_HOST=rabbitmq
QUEUE_RABBITMQ_PORT=5672
QUEUE_RABBITMQ_USER=domestic_api  # ou domestic_worker, domestic_cron
QUEUE_RABBITMQ_PASS=backendapi123
```

---

## MongoDB

**Host Local:** `localhost:27017`  
**Host Kubernetes:** `mongo:27017`

### Usuários

| Aplicação | Usuário | Senha | Banco |
|-----------|---------|-------|-------|
| Aplicações | `mongo` | `mongo1234` | zolve |

### Variáveis de Ambiente

```env
MONGO_URI=mongodb://mongo:mongo1234@mongo:27017/zolve
DATABASE_MONGO_HOST=mongo
DATABASE_MONGO_PORT=27017
DATABASE_MONGO_NAME=zolve
```

---

## Redis

**Host Local:** `localhost:6379`  
**Host Kubernetes:** `redis:6379`  
**Sem autenticação**

### Variáveis de Ambiente

```env
CACHE_REDIS_HOST=redis
CACHE_REDIS_PORT=6379
```

---

## Keycloak

**Host Local:** `localhost:8081`  
**Host Kubernetes:** `keycloak:8080`

### Credenciais Admin

| Campo | Valor |
|-------|-------|
| Usuário | `admin` |
| Senha | `admin` |

### Clientes Configurados

- **domestic-api**: `api-client-secret`
- **domestic-bff**: `bff-client-secret`

---

## Arquivo .env por Projeto

### domestic-backend-api

```env
DATABASE_POSTGRES_USER=domestic_api
DATABASE_POSTGRES_PASSWORD=backendapi123
QUEUE_RABBITMQ_USER=domestic_api
QUEUE_RABBITMQ_PASS=backendapi123
```

### domestic-backend-worker

```env
DATABASE_POSTGRES_USER=domestic_worker
DATABASE_POSTGRES_PASSWORD=backendapi123
RABBITMQ_URL=amqp://domestic_worker:backendapi123@rabbitmq:5672/
```

### domestic-backend-cron

```env
DATABASE_POSTGRES_USER=domestic_cron
DATABASE_POSTGRES_PASSWORD=backendapi123
QUEUE_RABBITMQ_USER=domestic_cron
QUEUE_RABBITMQ_PASS=backendapi123
```

### domestic-backend-bff

```env
# Não usa PostgreSQL ou RabbitMQ
# Apenas MongoDB e Redis
```

---

## Script de Inicialização

Para resetar o banco e RabbitMQ com os usuários corretos:

```bash
./scripts/init-database.sh
```

Ver: [DATABASE_RESET.md](./DATABASE_RESET.md)

---

## Notas Importantes

1. **Nunca commitar arquivos .env** com credenciais reais
2. **Usar .env.example** como template para novos setups
3. **Em Kubernetes**, as credenciais são gerenciadas via ConfigMaps e Secrets
4. **Para desenvolvimento local**, copiar `.env.example` → `.env` e ajustar hosts/ports
5. **Todas as senhas usam o padrão:** `backendapi123` (pode ser alterado conforme necessário)
