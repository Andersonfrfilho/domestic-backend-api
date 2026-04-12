export const SEND_PHONE_VERIFICATION_LOG_MESSAGES = {
  START_FLOW: 'Starting send phone verification flow',
  USER_PHONE_NOT_FOUND: 'User phone not found or does not belong to user',
  ALREADY_VERIFIED: 'Phone is already verified',
  CODE_STORED: 'Verification code stored in cache',
  CODE_SENT: 'Verification code sent successfully',
  CODE_SKIPPED_NON_PROD: 'Verification code sending skipped in non-production environment',
  DEV_CODE_GENERATED: 'Dev verification code generated',
} as const;

export const PHONE_VERIFICATION_TTL_SECONDS = 300;
export const PHONE_VERIFICATION_CODE_LENGTH = 6;
