# Procedimento de Reset Completo do Banco de Dados

Este documento descreve como fazer um reset completo do PostgreSQL e RabbitMQ do Kubernetes e subir tudo do zero com os usuários corretos.

## Credenciais dos Aplicativos

Os seguintes usuários serão criados automaticamente:

| Aplicação | Usuário PostgreSQL | Usuário RabbitMQ | Senha |
|-----------|-------------------|------------------|-------|
| API | `domestic_api` | `domestic_api` | `backendapi123` |
| Worker | `domestic_worker` | `domestic_worker` | `backendapi123` |
| Cron | `domestic_cron` | `domestic_cron` | `backendapi123` |

## Passos para Reset Completo

### 1. Destruir os PVCs (Persistent Volume Claims) para limpar dados

```bash
# Deletar os dados do PostgreSQL
kubectl delete pvc -n domestic data-postgres-0

# Deletar os dados do RabbitMQ
kubectl delete pvc -n domestic data-rabbitmq-0

# Deletar os dados do MongoDB
kubectl delete pvc -n domestic data-mongo-0

# Deletar os dados do Redis
kubectl delete pvc -n domestic redis-data
```

### 2. Verificar que os pods estão sendo recriados

```bash
kubectl get pods -n domestic | grep -E "postgres|rabbitmq|mongo|redis"
```

Aguardar até que todos os pods voltem ao estado `1/1 Running`.

### 3. Executar o script de inicialização do banco de dados

```bash
./scripts/init-database.sh
```

Este script irá:
- Criar os 3 usuários no PostgreSQL com permissões apropriadas
- Criar os 3 usuários no RabbitMQ com permissões apropriadas
- Configurar o banco `backend_database_postgres`

### 4. Verificar que o banco está pronto

```bash
# Listar usuários do PostgreSQL
kubectl exec -n domestic pod/postgres-0 -- psql -U domestic -d domestic_postgres -c "\du"

# Listar usuários do RabbitMQ
kubectl exec -n domestic pod/rabbitmq-0 -- rabbitmqctl list_users
```

### 5. Fazer rollout dos deployments

```bash
kubectl rollout -n domestic restart deployment/api deployment/worker deployment/cron
```

### 6. Verificar que os apps estão rodando

```bash
kubectl get pods -n domestic | grep -E "^(api|worker|cron)-"
```

Todos os pods devem estar em estado `1/1 Running`.

## Se os Apps não forem Ready

Se os apps ficarem em `CrashLoopBackOff`, verifique:

1. **PostgreSQL conectando**: 
   ```bash
   kubectl logs -n domestic deployment/api | grep -i "database\|postgres"
   ```

2. **RabbitMQ conectando**:
   ```bash
   kubectl logs -n domestic deployment/worker | grep -i "rabbitmq\|amqp"
   ```

3. **Credenciais nos ConfigMaps/Secrets**:
   ```bash
   kubectl get configmap -n domestic api-config -o jsonpath='{.data.DATABASE_POSTGRES_USER}'
   kubectl get secret -n domestic api-secret -o jsonpath='{.data.DATABASE_POSTGRES_USER}' | base64 -d
   ```

## Configuração Persistente (Recomendado)

Para que os usuários sejam criados **automaticamente** quando o cluster for destruído e recriado:

1. Criar um Helm Chart que inclua Init Jobs
2. Usar a imagem de banco com init scripts no Dockerfile
3. Usar Operators Kubernetes (postgresql-operator, rabbitmq-operator)

Por enquanto, o script `scripts/init-database.sh` deve ser executado manualmente após cada reset.

## Notas

- O banco `backend_database_postgres` já existe no ConfigMap/Secret dos apps
- As senhas estão em base64 nos Secrets do Kubernetes
- Os usuários têm acesso apenas ao banco `backend_database_postgres` (não aos outros bancos)
- As permissões incluem todas as tabelas e sequências, com permissões futuras herdadas
