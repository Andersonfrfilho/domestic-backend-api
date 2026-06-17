export interface UpdateCompanyUseCaseInterface {
  execute(params: UpdateCompanyUseCaseParams): Promise<UpdateCompanyUseCaseResponse>;
}

export interface UpdateCompanyUseCaseParams {
  companyId: string;
  requestingUserId: string;
  companyName?: string;
  tradeName?: string | null;
  email?: string;
  phone?: string;
  stateRegistration?: string | null;
  municipalRegistration?: string | null;
}

export interface UpdateCompanyUseCaseResponse {
  id: string;
  companyName: string;
  tradeName: string | null;
  email: string;
  phone: string;
  stateRegistration: string | null;
  municipalRegistration: string | null;
  status: string;
}
