export const SELF_UNLOCK_VERIFY_LOG_MESSAGES = {
  START_FLOW: 'Starting self-unlock verify flow',
  BLOCK_NOT_FOUND: 'Active block not found',
  CODE_INVALID: 'Invalid verification code',
  CODE_EXPIRED: 'Verification code expired',
  MAX_ATTEMPTS: 'Maximum verification attempts reached',
  SUCCESS: 'Self-unlock successful — block resolved and link transferred',
  ATTEMPT_FAILED: 'Verification attempt failed',
} as const;

export const MAX_ATTEMPTS = 3;
export const ATTEMPTS_CACHE_TTL_SECONDS = 3600;
export const EMAIL_CONFLICT = 'EMAIL_CONFLICT';
