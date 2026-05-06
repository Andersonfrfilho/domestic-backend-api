# Docker Image Versioning com Git Commit Hash

As imagens Docker devem ser versionadas com o hash curto do commit para garantir rastreabilidade e reprodutibilidade.

## Estrutura de Tags

Cada imagem é tagueada com **3 tags**:

```
ghcr.io/andersonfrfilho/domestic-backend-api:abc123f   ← Commit hash (RECOMENDADO)
ghcr.io/andersonfrfilho/domestic-backend-api:main      ← Branch
ghcr.io/andersonfrfilho/domestic-backend-api:latest    ← Latest
```

## Build Local

### Método 1: Usar o script build.sh (Recomendado)

```bash
cd domestic-backend-api
./build.sh

# Output:
# Building image: ghcr.io/andersonfrfilho/domestic-backend-api:abc123f
# ✓ Build completo!
#
# Tags geradas:
#   - ghcr.io/andersonfrfilho/domestic-backend-api:abc123f  (commit hash - RECOMENDADO)
#   - ghcr.io/andersonfrfilho/domestic-backend-api:main      (branch atual)
#   - ghcr.io/andersonfrfilho/domestic-backend-api:latest    (latest)
```

### Método 2: Build manual

```bash
COMMIT_HASH=$(git rev-parse --short HEAD)
BRANCH=$(git rev-parse --abbrev-ref HEAD)
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')

docker build \
  --build-arg GIT_COMMIT_HASH="${COMMIT_HASH}" \
  --build-arg GIT_COMMIT_HASH_FULL="$(git rev-parse HEAD)" \
  --build-arg GIT_BRANCH="${BRANCH}" \
  --build-arg BUILD_DATE="${BUILD_DATE}" \
  -t ghcr.io/andersonfrfilho/domestic-backend-api:${COMMIT_HASH} \
  -t ghcr.io/andersonfrfilho/domestic-backend-api:${BRANCH} \
  -t ghcr.io/andersonfrfilho/domestic-backend-api:latest \
  .
```

## Labels na Imagem

Cada imagem contém labels com informações de rastreamento:

```bash
docker inspect ghcr.io/andersonfrfilho/domestic-backend-api:abc123f | jq '.Config.Labels'

# Output:
# {
#   "build.date": "2026-05-06T23:00:00Z",
#   "git.branch": "main",
#   "git.commit.hash": "abc123f",
#   "git.commit.hash.full": "abc123f1234567890abcdef1234567890abcdef1",
#   "maintainer": "Anderson"
# }
```

## Deploy no Kubernetes

Usar o **commit hash** é a forma mais segura:

```bash
# Recomendado: Usar o hash do commit
COMMIT=$(git rev-parse --short HEAD)
kubectl set image deployment/api \
  api=ghcr.io/andersonfrfilho/domestic-backend-api:${COMMIT} \
  -n domestic

# Ou usar directly no kustomize/helm
image: ghcr.io/andersonfrfilho/domestic-backend-api:abc123f  # específico
```

## Push para Registry

```bash
# Build
./build.sh

# Push todas as tags
COMMIT=$(git rev-parse --short HEAD)
BRANCH=$(git rev-parse --abbrev-ref HEAD)

docker push ghcr.io/andersonfrfilho/domestic-backend-api:${COMMIT}
docker push ghcr.io/andersonfrfilho/domestic-backend-api:${BRANCH}
docker push ghcr.io/andersonfrfilho/domestic-backend-api:latest
```

## CI/CD Integration

No GitHub Actions:

```yaml
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: |
      ghcr.io/andersonfrfilho/domestic-backend-api:${{ github.sha }}
      ghcr.io/andersonfrfilho/domestic-backend-api:${{ github.ref_name }}
      ghcr.io/andersonfrfilho/domestic-backend-api:latest
    build-args: |
      GIT_COMMIT_HASH=${{ github.sha }}
      GIT_COMMIT_HASH_FULL=${{ github.sha }}
      GIT_BRANCH=${{ github.ref_name }}
      BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
```

## Rastreabilidade

Com o versionamento por commit hash, é possível:

1. **Reproduzir exatamente** qual código está em produção
2. **Reverter** para uma versão anterior facilmente
3. **Auditar** quem fez deploy de qual versão
4. **Investigar** bugs conhecendo a versão exata

### Exemplo: Rastrear um deployment

```bash
# Qual commit está rodando?
kubectl get deployment/api -n domestic -o jsonpath='{.spec.template.spec.containers[0].image}'
# Output: ghcr.io/andersonfrfilho/domestic-backend-api:abc123f

# Ver o commit no git
git log --oneline | grep abc123f
# Output: abc123f1 fix: RabbitMQ connection issue

# Ver o diff daquele commit
git show abc123f1
```

## Melhorias Futuras

Para maior controle, considerar adicionar:

- **Versão semântica**: `v1.2.3-abc123f`
- **Terraform/Helm values**: automático com hash no deploy
- **SBOMs (Software Bill of Materials)**: rastrear dependências
- **Image scanning**: segurança de imagem no registry

## Scripts de Utilidade

### Ver labels de uma imagem local

```bash
docker inspect ghcr.io/andersonfrfilho/domestic-backend-api:main | \
  jq '.Config.Labels | to_entries[] | "\(.key): \(.value)"'
```

### Comparar imagens

```bash
# Qual commit está em cada tag?
docker inspect ghcr.io/andersonfrfilho/domestic-backend-api:main | \
  jq '.Config.Labels."git.commit.hash"'
docker inspect ghcr.io/andersonfrfilho/domestic-backend-api:latest | \
  jq '.Config.Labels."git.commit.hash"'
```

### Limpar tags antigas

```bash
# Manter apenas últimos 10 commits
git log --oneline -10 | awk '{print $1}' | while read commit; do
  docker pull ghcr.io/andersonfrfilho/domestic-backend-api:$commit 2>/dev/null || true
done
```

## Referências

- [OCI Image Spec - Labels](https://github.com/opencontainers/image-spec/blob/main/annotations.md)
- [Docker Build Args](https://docs.docker.com/engine/reference/builder/#arg)
- [Semantic Versioning](https://semver.org/)
