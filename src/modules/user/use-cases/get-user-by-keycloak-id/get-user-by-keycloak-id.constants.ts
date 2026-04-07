export const GET_USER_BY_KEYCLOAK_ID_LOG_CONTEXT = 'GetUserByKeycloakIdUseCase.execute';

export const GET_USER_BY_KEYCLOAK_ID_LOG_MESSAGES = {
  START_FLOW: 'Starting get user by keycloakId flow',
  USER_NOT_FOUND: 'User not found for keycloakId',
  USER_FOUND: 'User resolved by keycloakId',
} as const;
