export interface AcceptTermsParams {
  userId: string;
  termsVersionId?: string;
  ipAddress?: string;
}

export interface AcceptTermsResponse {
  success: boolean;
  message: string;
  termsVersion: string;
  acceptedAt: Date;
}

export interface AcceptTermsUseCaseInterface {
  execute(params: AcceptTermsParams): Promise<AcceptTermsResponse>;
}
