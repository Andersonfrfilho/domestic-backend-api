export interface ForgotPasswordParams {
  email: string;
}

export interface ForgotPasswordUseCaseInterface {
  execute(params: ForgotPasswordParams): Promise<void>;
}
