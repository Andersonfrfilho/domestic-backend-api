import type { AccountBlockReason } from '../get-status/get-status.interface';

export interface CreateAccountBlockParams {
  userId: string;
  reason: AccountBlockReason;
  message?: string;
  canRetryAt?: Date | null;
  metadata?: Record<string, unknown>;
}

export interface CreateAccountBlockResult {
  id: string;
  userId: string;
  reason: AccountBlockReason;
  blockedAt: Date;
}

export interface CreateAccountBlockUseCaseInterface {
  execute(params: CreateAccountBlockParams): Promise<CreateAccountBlockResult>;
}
