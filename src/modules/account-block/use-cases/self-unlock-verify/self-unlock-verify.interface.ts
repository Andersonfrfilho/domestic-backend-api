export interface SelfUnlockVerifyParams {
  blockId: string;
  userId: string;
  code: string;
}

export interface SelfUnlockVerifyResult {
  success: boolean;
  blockResolved: boolean;
  message: string;
  canRetryAt?: string;
}

export interface SelfUnlockVerifyUseCaseInterface {
  execute(params: SelfUnlockVerifyParams): Promise<SelfUnlockVerifyResult>;
}
