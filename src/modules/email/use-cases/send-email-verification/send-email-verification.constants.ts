export const SEND_EMAIL_VERIFICATION_LOG_MESSAGES = {
  START_FLOW: 'Starting send email verification flow',
  USER_EMAIL_NOT_FOUND: 'User email not found or does not belong to user',
  ALREADY_VERIFIED: 'Email is already verified',
  CODE_STORED: 'Verification code stored in cache',
  CODE_SENT: 'Verification code sent successfully',
  CODE_SKIPPED_NON_PROD: 'Verification code sending skipped in non-production environment',
  CODE_GENERATED: 'Verification code generated',
} as const;

export const EMAIL_VERIFICATION_TTL_SECONDS = 300;
export const EMAIL_VERIFICATION_DEV_CODE = '0000';
