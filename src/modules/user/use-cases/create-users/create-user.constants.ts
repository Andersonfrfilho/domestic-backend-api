export const CREATE_USER_LOG_CONTEXT = 'UserApplicationCreateUseCase.execute';

export const CREATE_USER_LOG_MESSAGES = {
  START_FLOW: 'Starting user creation flow',
  DUPLICATE_KEYCLOAK_ID: 'User creation aborted due to duplicated keycloakId',
  CREATED_SUCCESS: 'User created successfully',
} as const;
