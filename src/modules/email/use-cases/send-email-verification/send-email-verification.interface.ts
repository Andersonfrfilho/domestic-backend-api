export interface SendEmailVerificationUseCaseParams {
  userId: string;
  userEmailId: string;
}

export interface SendEmailVerificationUseCaseInterface {
  execute(params: SendEmailVerificationUseCaseParams): Promise<void>;
}
