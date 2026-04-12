export const VERIFY_EMAIL_CODE_LOG_MESSAGES = {
  START_FLOW: 'Starting verify email code flow',
  USER_EMAIL_NOT_FOUND: 'User email not found or does not belong to user',
  ALREADY_VERIFIED: 'Email is already verified',
  CODE_NOT_FOUND: 'Verification code not found or expired',
  CODE_INVALID: 'Verification code does not match',
  EMAIL_VERIFIED: 'Email verified successfully',
  CODE_RECEIVED: 'Verification code received',
} as const;
