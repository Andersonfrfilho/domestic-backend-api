#!/usr/bin/env bash
# =============================================================================
# dev-session.sh — Ambiente de testes manuais para o domestic-backend-api
#
# USO: source scripts/dev-session.sh
#
# O script configura no terminal atual:
#   - URLs base (API, Kong, Keycloak)
#   - Tokens de serviço e de usuário
#   - Keycloak IDs (sub) de cada usuário de teste
#   - Funções utilitárias: kc_token, kc_id, api, kong
# =============================================================================

# ---------------------------------------------------------------------------
# 1. Dependências
# ---------------------------------------------------------------------------
if ! command -v jq &>/dev/null; then
  echo "[dev-session] ERRO: jq não encontrado. Instale com: brew install jq"
  return 1 2>/dev/null || exit 1
fi

# ---------------------------------------------------------------------------
# 2. URLs base
# ---------------------------------------------------------------------------
export API_URL="http://localhost:3333"
export KONG_URL="http://localhost:8000"
export KC_URL="http://localhost:8080"
export KC_REALM="domestic-backend"
export KC_TOKEN_URL="${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/token"

# ---------------------------------------------------------------------------
# 3. Credenciais dos clients Keycloak
# ---------------------------------------------------------------------------
export KC_BFF_CLIENT="domestic-backend-bff"
export KC_BFF_SECRET="backend-bff-client-secret"
export KC_API_CLIENT="domestic-api"
export KC_API_SECRET="api-client-secret"

# ---------------------------------------------------------------------------
# 4. Função auxiliar: busca token (retorna access_token)
#    Uso: kc_token <grant_type> [username] [password] [client_id] [client_secret]
# ---------------------------------------------------------------------------
kc_token() {
  local grant_type="${1}"
  local username="${2:-}"
  local password="${3:-}"
  local client_id="${4:-$KC_BFF_CLIENT}"
  local client_secret="${5:-$KC_BFF_SECRET}"

  local body="grant_type=${grant_type}&client_id=${client_id}&client_secret=${client_secret}"
  if [[ "$grant_type" == "password" ]]; then
    body="${body}&username=${username}&password=${password}"
  fi

  curl -s -X POST "$KC_TOKEN_URL" \
    -H 'Content-Type: application/x-www-form-urlencoded' \
    -d "$body" | jq -r '.access_token'
}

# ---------------------------------------------------------------------------
# 5. Função auxiliar: extrai o sub (keycloak_id) de um JWT
#    Uso: kc_id <jwt>
# ---------------------------------------------------------------------------
kc_id() {
  local token="${1}"
  echo "${token}" | cut -d '.' -f2 | base64 -d 2>/dev/null | jq -r '.sub'
}

# ---------------------------------------------------------------------------
# 6. Tokens
# ---------------------------------------------------------------------------
echo "[dev-session] Obtendo tokens do Keycloak..."

SERVICE_TOKEN=$(kc_token "client_credentials" "" "" "$KC_API_CLIENT" "$KC_API_SECRET")
USER_TOKEN=$(kc_token "password" "contractor-test" "ChangeMeSecurePassword123!")
PROVIDER_TOKEN=$(kc_token "password" "provider-test" "ChangeMeSecurePassword123!")
ADMIN_TOKEN=$(kc_token "password" "admin" "ChangeMeSecurePassword123!")
SUPPORT_TOKEN=$(kc_token "password" "support-test" "ChangeMeSecurePassword123!")

export SERVICE_TOKEN USER_TOKEN PROVIDER_TOKEN ADMIN_TOKEN SUPPORT_TOKEN

# ---------------------------------------------------------------------------
# 7. Keycloak IDs (sub dos tokens)
# ---------------------------------------------------------------------------
USER_KEYCLOAK_ID=$(kc_id "$USER_TOKEN")
PROVIDER_KEYCLOAK_ID=$(kc_id "$PROVIDER_TOKEN")
ADMIN_KEYCLOAK_ID=$(kc_id "$ADMIN_TOKEN")
SUPPORT_KEYCLOAK_ID=$(kc_id "$SUPPORT_TOKEN")

export USER_KEYCLOAK_ID PROVIDER_KEYCLOAK_ID ADMIN_KEYCLOAK_ID SUPPORT_KEYCLOAK_ID

# ---------------------------------------------------------------------------
# 8. IDs internos dos usuários na API (UUID da tabela users, diferente do keycloakId)
#    Usa GET /v1/users/me via Kong — resolve pelo X-Access-Token de cada usuário
# ---------------------------------------------------------------------------
echo "[dev-session] Buscando IDs internos dos usuários na API..."

_fetch_db_id() {
  local user_token="${1}"
  curl -s "${API_URL}/v1/users/me" -H "X-Access-Token: ${user_token}" 2>/dev/null | jq -r '.id // empty'
}

USER_DB_ID=$(_fetch_db_id "$USER_TOKEN")
PROVIDER_DB_ID=$(_fetch_db_id "$PROVIDER_TOKEN")
ADMIN_DB_ID=$(_fetch_db_id "$ADMIN_TOKEN")

export USER_DB_ID PROVIDER_DB_ID ADMIN_DB_ID

# ---------------------------------------------------------------------------
# 9. Funções de atalho para chamadas
#    api  <method> <path> [body]  — chama direto na API (porta 3333)
#    kong <method> <path> [body]  — chama via Kong (porta 8000)
# ---------------------------------------------------------------------------
api() {
  local method="${1:?método obrigatório}"
  local path="${2:?path obrigatório}"
  local body="${3:-}"

  if [[ -n "$body" ]]; then
    curl -s -X "$method" "${API_URL}${path}" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${SERVICE_TOKEN}" \
      -d "$body" | jq
  else
    curl -s -X "$method" "${API_URL}${path}" \
      -H "Authorization: Bearer ${SERVICE_TOKEN}" | jq
  fi
}

kong() {
  local method="${1:?método obrigatório}"
  local path="${2:?path obrigatório}"
  local body="${3:-}"
  local user_token="${4:-$USER_TOKEN}"

  if [[ -n "$body" ]]; then
    curl -s -X "$method" "${KONG_URL}${path}" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${SERVICE_TOKEN}" \
      -H "X-Access-Token: ${user_token}" \
      -d "$body" | jq
  else
    curl -s -X "$method" "${KONG_URL}${path}" \
      -H "Authorization: Bearer ${SERVICE_TOKEN}" \
      -H "X-Access-Token: ${user_token}" | jq
  fi
}

export -f kc_token kc_id api kong

# ---------------------------------------------------------------------------
# 9. Resumo
# ---------------------------------------------------------------------------
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              dev-session — domestic-backend-api              ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║ URLs                                                         ║"
printf "║  API_URL      %-47s ║\n" "$API_URL"
printf "║  KONG_URL     %-47s ║\n" "$KONG_URL"
printf "║  KC_URL       %-47s ║\n" "$KC_URL"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║ Tokens (primeiros 40 chars)                                  ║"
printf "║  SERVICE_TOKEN    %.40s... ║\n" "$SERVICE_TOKEN"
printf "║  USER_TOKEN       %.40s... ║\n" "$USER_TOKEN"
printf "║  PROVIDER_TOKEN   %.40s... ║\n" "$PROVIDER_TOKEN"
printf "║  ADMIN_TOKEN      %.40s... ║\n" "$ADMIN_TOKEN"
printf "║  SUPPORT_TOKEN    %.40s... ║\n" "$SUPPORT_TOKEN"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║ Keycloak IDs (sub do JWT — usado em keycloakId)              ║"
printf "║  USER_KEYCLOAK_ID      %s ║\n" "$USER_KEYCLOAK_ID"
printf "║  PROVIDER_KEYCLOAK_ID  %s ║\n" "$PROVIDER_KEYCLOAK_ID"
printf "║  ADMIN_KEYCLOAK_ID     %s ║\n" "$ADMIN_KEYCLOAK_ID"
printf "║  SUPPORT_KEYCLOAK_ID   %s ║\n" "$SUPPORT_KEYCLOAK_ID"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║ IDs internos (UUID da tabela users — usado nas rotas)        ║"
printf "║  USER_DB_ID      %s ║\n" "${USER_DB_ID:-(não encontrado — usuário ainda não criado)}"
printf "║  PROVIDER_DB_ID  %s ║\n" "${PROVIDER_DB_ID:-(não encontrado — usuário ainda não criado)}"
printf "║  ADMIN_DB_ID     %s ║\n" "${ADMIN_DB_ID:-(não encontrado — usuário ainda não criado)}"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║ Funções disponíveis                                          ║"
echo "║  api  <METHOD> <path> [body]   → chama direto na API        ║"
echo "║  kong <METHOD> <path> [body]   → chama via Kong             ║"
echo "║  kc_token <grant> [user] [pw]  → obtém token do Keycloak    ║"
echo "║  kc_id <jwt>                   → extrai sub do JWT          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Exemplos:"
echo "  api GET /v1/health"
echo "  api POST /v1/users '{\"fullName\":\"João\",\"keycloakId\":\"$USER_KEYCLOAK_ID\"}'"
echo "  curl -s 'http://localhost:3333/v1/users/me' -H 'X-Access-Token: \$USER_TOKEN' | jq"
echo "  api DELETE /v1/users/$USER_DB_ID"
echo "  api POST /v1/users/$USER_DB_ID/restore"
