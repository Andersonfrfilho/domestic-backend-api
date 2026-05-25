#!/bin/bash
# Script para inicializar usuários no PostgreSQL e RabbitMQ
# Uso: ./scripts/init-database.sh

set -e

NAMESPACE="domestic"

echo "=== Inicializando PostgreSQL ==="
echo "Criando usuários: domestic_api, domestic_cron, domestic_worker"

kubectl exec -n $NAMESPACE pod/postgres-0 -- psql -U domestic -d backend_database_postgres << 'PSQL'
-- Remover privilégios antes de deletar usuários
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM domestic_api;
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM domestic_cron;
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM domestic_worker;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM domestic_api;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM domestic_cron;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM domestic_worker;

-- Deletar usuários
DROP USER IF EXISTS domestic_api;
DROP USER IF EXISTS domestic_cron;
DROP USER IF EXISTS domestic_worker;

-- Criar novos usuários com senha: backendapi123
CREATE USER domestic_api WITH PASSWORD 'backendapi123';
CREATE USER domestic_cron WITH PASSWORD 'backendapi123';
CREATE USER domestic_worker WITH PASSWORD 'backendapi123';

-- Conceder permissões
GRANT CONNECT ON DATABASE backend_database_postgres TO domestic_api;
GRANT CONNECT ON DATABASE backend_database_postgres TO domestic_cron;
GRANT CONNECT ON DATABASE backend_database_postgres TO domestic_worker;
GRANT USAGE ON SCHEMA public TO domestic_api;
GRANT USAGE ON SCHEMA public TO domestic_cron;
GRANT USAGE ON SCHEMA public TO domestic_worker;
GRANT CREATE ON SCHEMA public TO domestic_api;
GRANT CREATE ON SCHEMA public TO domestic_cron;
GRANT CREATE ON SCHEMA public TO domestic_worker;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO domestic_api;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO domestic_cron;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO domestic_worker;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO domestic_api;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO domestic_cron;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO domestic_worker;
-- Default privileges para tabelas criadas pelo superuser (domestic)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO domestic_api;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO domestic_cron;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO domestic_worker;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO domestic_api;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO domestic_cron;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO domestic_worker;

-- Default privileges para tabelas criadas pelo domestic_api (migrações TypeORM)
-- Garante que novas tabelas criadas por migrations também sejam acessíveis
ALTER DEFAULT PRIVILEGES FOR ROLE domestic_api IN SCHEMA public GRANT ALL ON TABLES TO domestic_cron;
ALTER DEFAULT PRIVILEGES FOR ROLE domestic_api IN SCHEMA public GRANT ALL ON TABLES TO domestic_worker;
ALTER DEFAULT PRIVILEGES FOR ROLE domestic_api IN SCHEMA public GRANT ALL ON SEQUENCES TO domestic_cron;
ALTER DEFAULT PRIVILEGES FOR ROLE domestic_api IN SCHEMA public GRANT ALL ON SEQUENCES TO domestic_worker;
PSQL

echo "✓ PostgreSQL inicializado"

echo ""
echo "=== Inicializando RabbitMQ ==="
echo "Criando usuários: domestic_api, domestic_cron, domestic_worker"

kubectl exec -n $NAMESPACE pod/rabbitmq-0 -- bash -c '
rabbitmqctl delete_user domestic_api 2>/dev/null || true
rabbitmqctl delete_user domestic_cron 2>/dev/null || true
rabbitmqctl delete_user domestic_worker 2>/dev/null || true

rabbitmqctl add_user domestic_api backendapi123
rabbitmqctl add_user domestic_cron backendapi123
rabbitmqctl add_user domestic_worker backendapi123

rabbitmqctl set_permissions -p / domestic_api ".*" ".*" ".*"
rabbitmqctl set_permissions -p / domestic_cron ".*" ".*" ".*"
rabbitmqctl set_permissions -p / domestic_worker ".*" ".*" ".*"
'

echo "✓ RabbitMQ inicializado"
echo ""
echo "=== ✓ Banco de dados pronto para usar ==="
echo ""
echo "Usuários criados:"
echo "  - domestic_api / backendapi123"
echo "  - domestic_cron / backendapi123"
echo "  - domestic_worker / backendapi123"
