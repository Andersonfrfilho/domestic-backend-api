export interface CreateCompanyUseCaseInterface {
  execute(params: CreateCompanyUseCaseParams): Promise<CreateCompanyUseCaseResponse>;
}

export interface CreateCompanyUseCaseParams {
  document: string;
  companyName: string;
  tradeName?: string | null;
  email: string;
  phone: string;
  stateRegistration?: string | null;
  municipalRegistration?: string | null;
  adminUserId: string;
}

export interface CreateCompanyUseCaseResponse {
  id: string;
  document: string;
  companyName: string;
  tradeName: string | null;
  email: string;
  phone: string;
  status: string;
}
