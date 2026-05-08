export const VERIFY_EMAIL_CODE_LOG_MESSAGES = {
  START_FLOW: 'Starting verify email code flow',
  USER_EMAIL_NOT_FOUND: 'User email not found or does not belong to user',
  ALREADY_VERIFIED: 'Email is already verified',
  CODE_NOT_FOUND: 'Verification code not found or expired',
  CODE_INVALID: 'Verification code does not match',
  EMAIL_VERIFIED: 'Email verified successfully',
  KEYCLOAK_VERIFIED: 'Keycloak email verified',
  KEYCLOAK_VERIFY_ATTEMPT_FAILED: 'Keycloak verify email attempt failed',
  CODE_RECEIVED: 'Verification code received',
  EVENT_PUBLISHED: 'Email verified event published',
  EVENT_PUBLISH_FAILED: 'Failed to publish email verified event',
} as const;
