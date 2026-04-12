export const VERIFY_PHONE_CODE_LOG_MESSAGES = {
  START_FLOW: 'Starting verify phone code flow',
  USER_PHONE_NOT_FOUND: 'User phone not found or does not belong to user',
  ALREADY_VERIFIED: 'Phone is already verified',
  CODE_NOT_FOUND: 'Verification code not found or expired',
  CODE_INVALID: 'Verification code does not match',
  PHONE_VERIFIED: 'Phone verified successfully',
  DEV_CODE_RECEIVED: 'Dev verification code received',
} as const;
