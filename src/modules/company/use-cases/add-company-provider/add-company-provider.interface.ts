export interface AddCompanyProviderUseCaseInterface {
  execute(params: AddCompanyProviderUseCaseParams): Promise<AddCompanyProviderUseCaseResponse>;
}

export interface AddCompanyProviderUseCaseParams {
  companyId: string;
  providerId: string;
  role?: string;
  commissionRate?: number | null;
  fixedSalary?: number | null;
}

export interface AddCompanyProviderUseCaseResponse {
  id: string;
  companyId: string;
  providerId: string;
  role: string;
  commissionRate: number | null;
  fixedSalary: number | null;
  status: string;
}
