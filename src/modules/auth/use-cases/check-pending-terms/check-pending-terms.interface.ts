export interface CheckPendingTermsParams {
  userId: string;
}

export interface CheckPendingTermsResponse {
  hasPending: boolean;
  currentVersion: string | null;
  lastAcceptedVersion: string | null;
}

export interface CheckPendingTermsUseCaseInterface {
  execute(params: CheckPendingTermsParams): Promise<CheckPendingTermsResponse>;
}
