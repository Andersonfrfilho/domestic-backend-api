export interface SendVerificationCodeParams {
  destination: string;
  type: 'email' | 'phone';
}

export interface SendVerificationCodeResponse {
  success: boolean;
  message: string;
  expiresIn: number;
}

export interface SendVerificationCodeUseCaseInterface {
  execute(params: SendVerificationCodeParams): Promise<SendVerificationCodeResponse>;
}
