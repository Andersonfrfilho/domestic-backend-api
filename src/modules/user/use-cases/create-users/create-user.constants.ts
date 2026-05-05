export const CREATE_USER_LOG_MESSAGES = {
  START_FLOW: 'Starting user creation flow',
  DUPLICATE_KEYCLOAK_ID: 'User creation aborted due to duplicated keycloakId',
  KEYCLOAK_ID_BELONGS_TO_DELETED_USER:
    'User creation aborted: keycloakId belongs to a deleted account',
  CREATED_SUCCESS: 'User created successfully',
} as const;
