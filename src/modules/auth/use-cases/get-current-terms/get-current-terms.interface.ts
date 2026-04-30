export interface GetCurrentTermsVersionResponse {
  id: string;
  version: string;
  title: string;
  contentUrl: string | null;
  effectiveDate: Date;
}

export interface GetCurrentTermsVersionUseCaseInterface {
  execute(): Promise<GetCurrentTermsVersionResponse | null>;
}
