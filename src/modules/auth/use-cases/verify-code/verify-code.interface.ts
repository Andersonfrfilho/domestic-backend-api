export interface VerifyCodeParams {
  destination: string;
  type: 'email' | 'phone';
  code: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  verified: boolean;
  message: string;
}

export interface VerifyCodeUseCaseInterface {
  execute(params: VerifyCodeParams): Promise<VerifyCodeResponse>;
}
