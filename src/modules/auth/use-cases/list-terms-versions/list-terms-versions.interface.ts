export interface ListTermsVersionsResponse {
  id: string;
  version: string;
  title: string;
  contentUrl: string | null;
  isActive: boolean;
  effectiveDate: Date;
}

export interface ListTermsVersionsUseCaseInterface {
  execute(): Promise<ListTermsVersionsResponse[]>;
}
