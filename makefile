# ========================
# Variáveis de ambiente
# ========================
ENV_FILE := .env
ENV_DEV_LOCAL_FILE := .env.dev.local
ENV_EXAMPLE := .env.example
COMPOSE_FILE := docker-compose.yml  # Defina o arquivo docker-compose explicitamente
COMPOSE_DEV_FILE := docker-compose.dev.yml
COMPOSE_PROJECT_DEV := domestic

# Se o .env existir, carrega suas variáveis no Makefile
ifneq ("$(wildcard $(ENV_FILE))","")
include $(ENV_FILE)
export
endif

# ========================
# Regras
# ========================

# Regra para garantir que o .env exista
setup-env:
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "⚙️  Criando $(ENV_FILE) a partir de $(ENV_EXAMPLE)..."; \
		cp $(ENV_EXAMPLE) $(ENV_FILE); \
	else \
		echo "✅ $(ENV_FILE) já existe — nada a fazer."; \
	fi

# ========================
# Docker commands
# ========================

app: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d api

database_postgres: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d database_postgres

database_postgres-down: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) down database_postgres

database_postgres-stop: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) stop database_postgres

database_mongo: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d database_mongo

database_mongo-down: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) down database_mongo

cache_redis: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d cache_redis

cache_redis-down: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) down cache_redis

cache_redis-stop: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) stop cache_redis

database_mongo-stop: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) stop database_mongo

queue_rabbitmq: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d queue_rabbitmq
queue_rabbitmq-down: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) down queue_rabbitmq
queue_rabbitmq-stop: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) stop queue_rabbitmq

keycloak: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d keycloak database_keycloak

keycloak-down: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) down keycloak database_keycloak

keycloak-stop: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) stop keycloak database_keycloak

keycloak-logs: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) logs -f keycloak

keycloak-admin: setup-env
	@echo "🔗 Keycloak Admin Console: http://localhost:$(KEYCLOAK_PORT)"
	@echo "👤 Username: $(KEYCLOAK_ADMIN_USER)"
	@echo "🔑 Password: $(KEYCLOAK_ADMIN_PASSWORD)"

sonar-up: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d sonarqube sonar-db

sonar-down: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) down sonarqube sonar-db

sonar-scan: setup-env
	npm run sonar  # Executa o script de análise do SonarQube definido no package.json

stop: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) stop

storage-minio: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d storage-minio

storage-minio-down: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) down storage-minio

storage-minio-stop: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) stop storage-minio

down: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) down --remove-orphans

clean: clean-all

force-remove: setup-env
	docker rm -f $(shell docker ps -a -q --filter "name=$(SERVICE_NAME)")

clean-images: setup-env
	docker rmi -f $(shell docker images --filter=reference="$(PROJECT_NAME)*" -q)

clean-safe: setup-env
	@echo "🧹 Limpando containers e redes do projeto $(PROJECT_NAME), mas preservando volumes (dados persistentes como SonarQube token e configs)..."
	# Remove apenas containers e redes, sem volumes (-v)
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) down --remove-orphans

	# Remove imagens criadas com prefixo do projeto (opcional, preserva dados)
	-docker rmi -f $(shell docker images --filter=reference='$(PROJECT_NAME)*' -q)

	# Remove redes do projeto (se restarem)
	-docker network rm $(shell docker network ls --filter name=$(PROJECT_NAME) -q)

clean-all: setup-env
	@echo "🧹 Limpando todos os recursos do projeto $(PROJECT_NAME)..."
	# Force remove datadog-agent if it exists
	-docker rm -f datadog-agent 2>/dev/null || true
	# Remove containers, volumes e redes do projeto
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) down -v --remove-orphans
	# Remove imagens criadas com prefixo do projeto
	-docker rmi -f $(shell docker images --filter=reference='$(PROJECT_NAME)*' -q)

rebuild-app: setup-env
	@echo "🔄 Rebuildando a imagem do serviço 'api' após instalação de dependências..."
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) build api
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d --force-recreate api

all: setup-env
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d --remove-orphans
	@echo "✅ Projeto iniciado com sucesso! (migrations executadas pelo serviço migrator)"

setup-e2e-databases: setup-env
	@echo "🔧 Criando bancos de dados E2E..."
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d database_postgres database_mongo
	@echo "⏳ Aguardando PostgreSQL ficar pronto..."
	sleep 3
	@echo "⏳ Aguardando MongoDB ficar pronto..."
	sleep 3
	@echo "✅ Bancos de dados E2E criados com sucesso!"
	@echo "   - PostgreSQL: backend_database_test_e2e"
	@echo "   - MongoDB: backend_test_e2e"

test-e2e-ready: setup-env setup-e2e-databases
	@echo "🧪 Bancos de dados E2E preparados e prontos para testes!"
	npm run test:e2e

test-e2e-docker: setup-env
	@echo "🧪 Iniciando testes E2E com Docker Compose..."
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) --profile e2e up --abort-on-container-exit --exit-code-from e2e-tests

setup: setup-env
	@echo "🚀 Iniciando setup completo do projeto..."
	docker-compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d --remove-orphans
	@echo "✅ Setup completo! Projeto pronto para usar."


# ========================
# Desenvolvimento local (sem observabilidade)
# ========================

DEV_COMPOSE = docker-compose -p $(COMPOSE_PROJECT_DEV) -f $(COMPOSE_DEV_FILE)

dev-infra: setup-env
	@echo "🚀 Subindo infra essencial (postgres:5433, mongo, redis, rabbitmq, keycloak, mailpit)..."
	$(DEV_COMPOSE) up -d \
		database_postgres database_mongo cache_redis queue_rabbitmq \
		database_keycloak keycloak mailpit
	@echo ""
	@echo "✅ Infra no ar:"
	@echo "  PostgreSQL  → localhost:5433"
	@echo "  MongoDB     → localhost:27017"
	@echo "  Redis       → localhost:6379"
	@echo "  RabbitMQ    → localhost:5672  (UI: http://localhost:15672)"
	@echo "  Keycloak    → http://localhost:8080"
	@echo "  Mailpit     → http://localhost:8025"

dev-infra-down: setup-env
	$(DEV_COMPOSE) down

dev-infra-stop: setup-env
	$(DEV_COMPOSE) stop

dev: setup-env dev-infra
	@echo "▶ Iniciando API em modo dev com logs..."
	./scripts/dev-log.sh api "npm run start:dev:local"

migrate-dev:
	DATABASE_POSTGRES_HOST=localhost \
	DATABASE_POSTGRES_PORT=5433 \
	DATABASE_POSTGRES_NAME=backend_database_postgres \
	DATABASE_POSTGRES_USER=domestic_api \
	DATABASE_POSTGRES_PASSWORD=domestic123 \
	FORCE_TS=true \
	npm run migration:run

seed-dev:
	@echo "🌱 Rodando seeders locais (Keycloak + PostgreSQL + MongoDB)..."
	DATABASE_POSTGRES_HOST=localhost \
	DATABASE_POSTGRES_PORT=5433 \
	DATABASE_POSTGRES_NAME=backend_database_postgres \
	DATABASE_POSTGRES_USER=domestic_api \
	DATABASE_POSTGRES_PASSWORD=domestic123 \
	DOTENV_CONFIG_PATH=.env.dev.local \
	npm run seed

dev-app-build:
	@echo "🔨 Buildando imagens das aplicações..."
	$(DEV_COMPOSE) --profile app build

dev-app-up: setup-env
	@echo "🚀 Subindo migrator + API + BFF + Worker (migrations automáticas)..."
	$(DEV_COMPOSE) --profile app up -d
	@echo ""
	@echo "✅ Apps no ar:"
	@echo "  API     → http://localhost:3333"
	@echo "  BFF     → http://localhost:3335"
	@echo "  Worker  → porta 3002"
	@echo ""
	@echo "Logs: make dev-app-logs"

dev-app-down: setup-env
	$(DEV_COMPOSE) --profile app rm -sf migrator api bff worker

dev-app-logs:
	$(DEV_COMPOSE) --profile app logs -f api bff worker

dev-all: dev-infra seed-dev dev-app-up
	@echo ""
	@echo "✅ Stack completa no ar!"
	@echo "  PostgreSQL  → localhost:5433"
	@echo "  MongoDB     → localhost:27017"
	@echo "  Redis       → localhost:6379"
	@echo "  RabbitMQ    → localhost:5672  (UI: http://localhost:15672)"
	@echo "  Keycloak    → http://localhost:8080"
	@echo "  Mailpit     → http://localhost:8025"
	@echo "  API         → http://localhost:3333"
	@echo "  BFF         → http://localhost:3335"
	@echo ""
	@echo "Logs: make dev-app-logs"

.PHONY: all rebuild-app setup-env clean-all clean-images force-remove down stop app sonar-up sonar-down sonar-scan clean-safe database_postgres database_mongo queue_rabbitmq keycloak keycloak-down keycloak-stop keycloak-logs keycloak-admin setup setup-e2e-databases test-e2e-ready test-e2e-docker storage-minio storage-minio-down storage-minio-stop dev-infra dev-infra-down dev-infra-stop dev migrate-dev seed-dev dev-app-build dev-app-up dev-app-down dev-app-logs dev-all