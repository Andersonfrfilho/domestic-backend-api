# GitHub Actions CI/CD Workflows

Este projeto possui três workflows automáticos configurados no GitHub Actions para garantir qualidade de código e testes contínuos.

## 📋 Workflows Disponíveis

### 1. **CI/CD Pipeline** (`ci-cd.yml`)

Executa a cada push para `main`, `develop` e branches `feature/*`, bem como em Pull Requests para `main` e `develop`.

**Jobs executados:**

- **Lint**: ESLint + Prettier
- **Unit Tests**: Testes unitários com cobertura
- **E2E Tests**: Testes de integração completa
- **SonarQube**: Análise de qualidade de código
- **All Tests**: Executa todos os testes
- **Build**: Constrói a aplicação

**Artifacts:**

- Cobertura de testes (Codecov)
- Build da aplicação

### 2. **PR Checks** (`pr-checks.yml`)

Executa em Pull Requests para `main` e `develop` quando são abertos, sincronizados ou reabertes.

**Jobs executados:**

- **PR Lint**: Validação de código (ESLint, Prettier)
- **PR Tests**: Testes unitários + E2E
- **PR Build**: Verifica se a build é bem-sucedida
- **PR Coverage**: Gera relatório de cobertura comentado no PR

**Features:**

- Comentário automático com relatório de cobertura no PR
- Validação obrigatória antes de merge

### 3. **Docker Build** (`docker.yml`)

Executa quando há push para `main`, tags semânticas (`v*`) ou manualmente.

**Jobs executados:**

- **Build and Push Docker Image**: Constrói e publica imagem no GitHub Container Registry

**Features:**

- Tags automáticas baseadas em branches/tags
- Cache de layers para builds mais rápidos
- Publicação no ghcr.io

## 🔐 Secrets Necessários

Configure os seguintes secrets no repositório:

| Secret           | Descrição                                 | Tipo       |
| ---------------- | ----------------------------------------- | ---------- |
| `SONAR_HOST_URL` | URL do servidor SonarQube                 | Opcional   |
| `SONAR_TOKEN`    | Token de autenticação SonarQube           | Opcional   |
| `GITHUB_TOKEN`   | Token automático do GitHub (já fornecido) | Automático |

## 📊 Status do Workflow

Para ver o status dos workflows, acesse:

```
https://github.com/<owner>/<repo>/actions
```

## ✅ Requisitos Locais

Antes de fazer push, execute localmente:

```bash
# Validar lint
npm run lint:check

# Validar formato
npm run format:check

# Executar testes unitários
npm run test:unit

# Executar testes E2E
npm run test:e2e

# Executar todos os testes
npm run test:all

# Build da aplicação
npm run build
```

## 🔄 Fluxo de Desenvolvimento

1. **Criar feature branch**

   ```bash
   git checkout -b feature/nova-feature
   ```

2. **Fazer commits**

   ```bash
   git add .
   git commit -m "feat: descrição da feature"
   ```

3. **Push e criar Pull Request**

   ```bash
   git push origin feature/nova-feature
   ```

4. **O workflow PR Checks executará automaticamente**
   - Verificará lint e format
   - Rodará testes
   - Verificará build
   - Comentará relatório de cobertura

5. **Após aprovação e merge**
   - O workflow CI/CD executará
   - Código será analisado no SonarQube
   - Imagem Docker será construída e publicada

## 🚀 Deployment Automático

O workflow Docker é acionado:

- Automaticamente quando há push para `main`
- Ao criar uma tag semântica (`v1.0.0`)
- Manualmente via GitHub Actions

Imagens são publicadas em:

```
ghcr.io/<owner>/<repo>:latest
ghcr.io/<owner>/<repo>:v1.0.0
ghcr.io/<owner>/<repo>:sha-<commit-hash>
```

## 📝 Notas

- Todos os workflows rodam em `ubuntu-latest`
- Node.js versão 20 é usada
- NPM cache é ativado para builds mais rápidos
- Falhas em SonarQube não bloqueiam o build (continue-on-error: true)
- Codecov é opcional e não bloqueia builds

## 🔧 Troubleshooting

### Workflow falhando por lint

```bash
npm run lint  # Corrige automaticamente
git add .
git commit -m "style: fix linting"
git push
```

### Testes falhando localmente mas passando no CI

Certifique-se de limpar cache:

```bash
rm -rf node_modules dist coverage
npm ci
npm run test:all
```

### SonarQube não conectando

Verifique se `SONAR_TOKEN` e `SONAR_HOST_URL` estão configurados nos secrets.
# Test trigger for GitOps
# v2 - GitOps automation fixed
# v3 - Using annotations to trigger updates
# with improved logging
# final test with annotations
