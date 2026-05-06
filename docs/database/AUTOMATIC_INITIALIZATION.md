# Inicialização Automática do Banco de Dados

A inicialização dos usuários do PostgreSQL e RabbitMQ pode ser executada **automaticamente** após os serviços ficarem prontos usando um Kubernetes Job.

## Como Funciona

O Job `init-database-job` (definido em `k8s/init-database-job.yaml`):

1. **Aguarda os serviços ficarem prontos**
   - PostgreSQL (postgres-0) em status Ready
   - RabbitMQ (rabbitmq-0) em status Ready

2. **Executa o script de inicialização**
   - Cria usuários: `domestic_api`, `domestic_worker`, `domestic_cron`
   - Configura permissões no PostgreSQL
   - Configura permissões no RabbitMQ

3. **Completa automaticamente**
   - Job marca-se como Complete
   - Pode ser reexecutado conforme necessário

## Instalação

### Opção 1: Aplicar o Job manualmente

```bash
kubectl apply -f k8s/init-database-job.yaml
```

### Opção 2: Incluir no Helm Chart (Recomendado)

Adicionar o Job ao seu Helm Chart para que execute automaticamente no deploy:

```bash
helm install domestic ./helm/charts/domestic-infrastructure
```

## Monitorando a Execução

### Ver status do Job

```bash
kubectl get jobs -n domestic init-database-job
```

### Ver logs da inicialização

```bash
kubectl logs -n domestic job/init-database-job
```

### Logs detalhados (container-específico)

```bash
# Init container (espera pelos serviços)
kubectl logs -n domestic job/init-database-job -c wait-for-services

# Script de inicialização
kubectl logs -n domestic job/init-database-job -c init-script
```

### Verificar status em tempo real

```bash
kubectl get jobs -n domestic init-database-job -o wide --watch
```

## Se o Job Falhar

### Checklist de Troubleshooting

1. **PostgreSQL está pronto?**
   ```bash
   kubectl get pod postgres-0 -n domestic -o wide
   kubectl logs pod/postgres-0 -n domestic | tail -50
   ```

2. **RabbitMQ está pronto?**
   ```bash
   kubectl get pod rabbitmq-0 -n domestic -o wide
   kubectl logs pod/rabbitmq-0 -n domestic | tail -50
   ```

3. **ServiceAccount tem permissões?**
   ```bash
   kubectl get serviceaccount init-database -n domestic
   kubectl get clusterrolebinding init-database
   ```

4. **Deletar e recriar o Job**
   ```bash
   kubectl delete job init-database-job -n domestic
   kubectl apply -f k8s/init-database-job.yaml
   ```

## Reexecutando o Job

Se precisar reexecutar o Job (por exemplo, após limpar o banco):

### Opção 1: Deletar e recriar

```bash
kubectl delete job init-database-job -n domestic
kubectl apply -f k8s/init-database-job.yaml
```

### Opção 2: Usar o script manualmente

```bash
./scripts/init-database.sh
```

## Recursos do Job

| Recurso | Valor |
|---------|-------|
| Imagem | `bitnami/kubectl:latest` |
| Timeout | 10 minutos (600s) |
| Tentativas | até 3 (se falhar) |
| Paralelismo | 1 pod |
| Completions | 1 sucesso |

## Incluir no Deploy Automático

Para que o Job rode **automaticamente** quando você faz deploy da infraestrutura:

### Via Helm

1. Adicionar `k8s/init-database-job.yaml` ao Helm Chart
2. Usar `helm install domestic ./helm` para deploy inicial

### Via ArgoCD

1. Incluir `k8s/init-database-job.yaml` no repositório Git
2. ArgoCD aplicará automaticamente ao sincronizar

### Via Makefile

Adicionar ao seu Makefile:

```makefile
deploy-with-init:
	kubectl apply -f k8s/init-database-job.yaml
	kubectl wait --for=condition=complete job init-database-job -n domestic --timeout=600s
	kubectl rollout restart deployment/api deployment/worker deployment/cron -n domestic
```

## Customização

Para customizar o Job, edite `k8s/init-database-job.yaml`:

- **Timeout**: Alterar `activeDeadlineSeconds` (em segundos)
- **Tentativas**: Alterar `backoffLimit` (número de tentativas)
- **Imagem**: Customizar a imagem do kubectl se necessário
- **Senhas**: Alterar a senha no ConfigMap (não recomendado em produção)

## Segurança em Produção

⚠️ **Importante:** Em produção, considere:

1. **Armazenar senhas em Vault ou Secret Management**
   ```bash
   # Em vez de hardcoded no ConfigMap
   POSTGRES_PASSWORD=$(vault kv get -field=password secret/postgres)
   ```

2. **Usar InitialDelaySeconds maiores**
   ```yaml
   activeDeadlineSeconds: 1200  # 20 minutos em produção
   ```

3. **Limitar permissões da ServiceAccount**
   ```yaml
   # Adicionar resourceNames ao ClusterRole
   resources: ["pods"]
   resourceNames: ["postgres-0", "rabbitmq-0"]
   ```

4. **Usar Job com `ttlSecondsAfterFinished`**
   ```yaml
   ttlSecondsAfterFinished: 3600  # Delete após 1 hora
   ```

## Relacionado

- [DATABASE_RESET.md](./DATABASE_RESET.md) - Reset manual completo
- [CREDENTIALS_REFERENCE.md](./CREDENTIALS_REFERENCE.md) - Referência de credenciais
- [../README.md](../README.md) - Documentação geral da infraestrutura
