export const UPDATE_USER_LOG_CONTEXT = 'UpdateUserUseCase.execute';

export const UPDATE_USER_LOG_MESSAGES = {
  START_FLOW: 'Starting update user flow',
  USER_NOT_FOUND: 'User not found for update',
  USER_IS_DELETED: 'User account is deleted',
  USER_UPDATED: 'User updated successfully',
} as const;
