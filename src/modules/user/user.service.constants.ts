export const USER_SERVICE_LOG_MESSAGES = {
  INVALIDATE_CACHE_ATTEMPT: 'Invalidating users:list cache',
  INVALIDATE_CACHE_SUCCESS: 'Cache invalidated',
  INVALIDATE_CACHE_FAILED: 'Cache invalidation failed',

  LIST_ADDRESSES_BY_KEYCLOAK_START: 'Starting list user addresses by keycloakId flow',
  LIST_ADDRESSES_BY_KEYCLOAK_SUCCESS: 'User addresses listed by keycloakId',

  ADD_ADDRESS_BY_KEYCLOAK_START: 'Starting add user address by keycloakId flow',
  ADD_ADDRESS_BY_KEYCLOAK_SUCCESS: 'User address added by keycloakId',

  REMOVE_ADDRESS_BY_KEYCLOAK_START: 'Starting remove user address by keycloakId flow',
  REMOVE_ADDRESS_BY_KEYCLOAK_SUCCESS: 'User address removed by keycloakId',
} as const;
