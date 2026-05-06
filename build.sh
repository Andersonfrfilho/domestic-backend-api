#!/bin/bash
# Script de build com versionamento por commit hash

set -e

# Configurações
REGISTRY="${REGISTRY:-ghcr.io/andersonfrfilho}"
IMAGE_NAME="domestic-backend-api"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
COMMIT_HASH=$(git rev-parse --short HEAD)
COMMIT_HASH_FULL=$(git rev-parse HEAD)
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
GIT_DIRTY=$(git status --porcelain | wc -l)

# Determinar tag - usar commit hash como versão primária
IMAGE_TAG="${REGISTRY}/${IMAGE_NAME}"

echo "=== Build Docker com Versionamento ==="
echo "Branch: $BRANCH"
echo "Commit (short): $COMMIT_HASH"
echo "Commit (full): $COMMIT_HASH_FULL"
echo "Build Date: $BUILD_DATE"
echo "Changes: $GIT_DIRTY"
echo ""

# Se houver changes não commitados, avisar
if [ "$GIT_DIRTY" -gt 0 ]; then
  echo "⚠️  Aviso: Existem $GIT_DIRTY arquivo(s) não commitado(s)"
  echo "   Os changes não serão incluídos na imagem"
  echo ""
fi

# Build com build args
echo "Building image: ${IMAGE_TAG}:${COMMIT_HASH}"
docker build \
  --build-arg GIT_COMMIT_HASH="${COMMIT_HASH}" \
  --build-arg GIT_COMMIT_HASH_FULL="${COMMIT_HASH_FULL}" \
  --build-arg GIT_BRANCH="${BRANCH}" \
  --build-arg BUILD_DATE="${BUILD_DATE}" \
  --label "git.commit.hash=${COMMIT_HASH}" \
  --label "git.commit.hash.full=${COMMIT_HASH_FULL}" \
  --label "git.branch=${BRANCH}" \
  --label "build.date=${BUILD_DATE}" \
  -t "${IMAGE_TAG}:${COMMIT_HASH}" \
  -t "${IMAGE_TAG}:${BRANCH}" \
  -t "${IMAGE_TAG}:latest" \
  .

echo ""
echo "✓ Build completo!"
echo ""
echo "Tags geradas:"
echo "  - ${IMAGE_TAG}:${COMMIT_HASH}  (commit hash - RECOMENDADO para produção)"
echo "  - ${IMAGE_TAG}:${BRANCH}       (branch atual)"
echo "  - ${IMAGE_TAG}:latest          (latest)"
echo ""
echo "Para fazer push:"
echo "  docker push ${IMAGE_TAG}:${COMMIT_HASH}"
echo "  docker push ${IMAGE_TAG}:${BRANCH}"
echo ""
echo "Para inspecionar labels:"
echo "  docker inspect ${IMAGE_TAG}:${COMMIT_HASH} | jq '.Config.Labels'"
