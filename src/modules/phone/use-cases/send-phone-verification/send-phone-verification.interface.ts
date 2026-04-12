export interface SendPhoneVerificationUseCaseParams {
  userId: string;
  userPhoneId: string;
}

export interface SendPhoneVerificationUseCaseInterface {
  execute(params: SendPhoneVerificationUseCaseParams): Promise<void>;
}
