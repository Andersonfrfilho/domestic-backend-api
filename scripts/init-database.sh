#!/bin/bash
# Script para inicializar usuários no PostgreSQL e RabbitMQ
# Uso: ./scripts/init-database.sh
#
# Padrão de permissões (PostgreSQL):
#   - backend_api     → CREATE + owner das tabelas (roda migrations)
#   - backend_services → role de grupo herdada por todos os serviços leitores/escritores
#   - Novos serviços: CREATE USER + GRANT backend_services TO <novo_user>
#     Não precisa alterar migrations para dar acesso a novas tabelas.
#
# Usuários RabbitMQ usam nomenclatura diferente: domestic_cron, domestic_worker

set -e

NAMESPACE="domestic"
DB_NAME="domestic_postgres"

echo "=== Inicializando PostgreSQL ==="
echo "Banco: ${DB_NAME}"
echo "Criando usuários: backend_api, backend_cron, backend_worker"

kubectl exec -n $NAMESPACE pod/postgres-0 -- env PGPASSWORD=postgres1234 psql -h localhost -U domestic -d postgres << PSQL
-- ============================================================
-- Limpeza — revoga antes de dropar para evitar erros
-- ============================================================
\c ${DB_NAME}

DO \$\$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'backend_services') THEN
    REVOKE ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public FROM backend_services;
    REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM backend_services;
  END IF;
END \$\$;

DO \$\$ BEGIN IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'backend_cron')   THEN REVOKE backend_services FROM backend_cron;   END IF; END \$\$;
DO \$\$ BEGIN IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'backend_worker') THEN REVOKE backend_services FROM backend_worker; END IF; END \$\$;

DROP USER IF EXISTS backend_api;
DROP USER IF EXISTS backend_cron;
DROP USER IF EXISTS backend_worker;
DROP ROLE IF EXISTS backend_services;

-- ============================================================
-- Role de grupo compartilhada por todos os serviços leitores
-- ============================================================
CREATE ROLE backend_services;

-- ============================================================
-- Usuários PostgreSQL
-- ============================================================
-- backend_api: owner das tabelas, roda migrations TypeORM
CREATE USER backend_api    WITH PASSWORD 'backendapi123';

-- Serviços leitores/escritores — herdam backend_services
CREATE USER backend_cron   WITH PASSWORD 'backendcron123';
CREATE USER backend_worker WITH PASSWORD 'backendworker123';

-- Para adicionar um novo serviço no futuro:
--   CREATE USER backend_<nome> WITH PASSWORD '...';
--   GRANT backend_services TO backend_<nome>;
-- Sem precisar alterar migrations ou este script além dessas duas linhas.

-- ============================================================
-- Permissões de conexão e schema
-- ============================================================
GRANT CONNECT ON DATABASE ${DB_NAME} TO backend_api;
GRANT CONNECT ON DATABASE ${DB_NAME} TO backend_services;

GRANT USAGE  ON SCHEMA public TO backend_api;
GRANT USAGE  ON SCHEMA public TO backend_services;
GRANT CREATE ON SCHEMA public TO backend_api;

-- ============================================================
-- Permissões de tabela e sequência
-- ============================================================
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO backend_api;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO backend_api;

GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO backend_services;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO backend_services;

-- ============================================================
-- Default privileges
-- Tabelas criadas pelo superuser (domestic): acessíveis a todos
-- ============================================================
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO backend_api;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO backend_services;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO backend_api;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO backend_services;

-- ============================================================
-- Default privileges
-- Tabelas criadas por backend_api (migrations TypeORM):
-- acessíveis automaticamente a backend_services (e seus membros)
-- ============================================================
ALTER DEFAULT PRIVILEGES FOR ROLE backend_api IN SCHEMA public
  GRANT ALL ON TABLES TO backend_services;
ALTER DEFAULT PRIVILEGES FOR ROLE backend_api IN SCHEMA public
  GRANT ALL ON SEQUENCES TO backend_services;

-- ============================================================
-- Associar serviços à role de grupo
-- ============================================================
GRANT backend_services TO backend_cron;
GRANT backend_services TO backend_worker;
PSQL

echo "✓ PostgreSQL inicializado"

echo ""
echo "=== Inicializando RabbitMQ ==="
echo "Criando usuários: domestic_cron, domestic_worker"

kubectl exec -n $NAMESPACE pod/rabbitmq-0 -- bash -c '
rabbitmqctl delete_user domestic_cron   2>/dev/null || true
rabbitmqctl delete_user domestic_worker 2>/dev/null || true

rabbitmqctl add_user domestic_cron   backendapi123
rabbitmqctl add_user domestic_worker backendapi123

rabbitmqctl set_permissions -p / domestic_cron   ".*" ".*" ".*"
rabbitmqctl set_permissions -p / domestic_worker ".*" ".*" ".*"
'

echo "✓ RabbitMQ inicializado"
echo ""
echo "=== ✓ Banco de dados pronto para usar ==="
echo ""
echo "Usuários PostgreSQL criados:"
echo "  - backend_api    / backendapi123    (owner, roda migrations)"
echo "  - backend_cron   / backendcron123   (membro de backend_services)"
echo "  - backend_worker / backendworker123 (membro de backend_services)"
echo ""
echo "Usuários RabbitMQ criados:"
echo "  - domestic_cron   / backendapi123"
echo "  - domestic_worker / backendapi123"
echo ""
echo "Para adicionar novo serviço PostgreSQL:"
echo "  CREATE USER backend_<nome> WITH PASSWORD '...';"
echo "  GRANT backend_services TO backend_<nome>;"
