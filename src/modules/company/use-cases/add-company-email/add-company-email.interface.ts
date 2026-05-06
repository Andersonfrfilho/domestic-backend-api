export interface AddCompanyEmailUseCaseInterface {
  execute(params: AddCompanyEmailUseCaseParams): Promise<AddCompanyEmailUseCaseResponse>;
}

export interface AddCompanyEmailUseCaseParams {
  companyId: string;
  email: string;
  type?: string;
  isDefault?: boolean;
}

export interface AddCompanyEmailUseCaseResponse {
  id: string;
  companyId: string;
  email: string;
  type: string;
  isDefault: boolean;
}
