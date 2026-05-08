import type { AccountBlockReason } from '../get-status/get-status.interface';

export interface SelfUnlockInitiateParams {
  blockId: string;
  userId: string;
}

export interface SelfUnlockInitiateResult {
  success: true;
  message: string;
  destination: string;
  expiresIn: number;
}

export interface SelfUnlockInitiateUseCaseInterface {
  execute(params: SelfUnlockInitiateParams): Promise<SelfUnlockInitiateResult>;
}
