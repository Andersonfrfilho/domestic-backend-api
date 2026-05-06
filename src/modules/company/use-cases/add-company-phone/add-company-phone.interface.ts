export interface AddCompanyPhoneUseCaseInterface {
  execute(params: AddCompanyPhoneUseCaseParams): Promise<AddCompanyPhoneUseCaseResponse>;
}

export interface AddCompanyPhoneUseCaseParams {
  companyId: string;
  phone: string;
  type?: string;
  isDefault?: boolean;
}

export interface AddCompanyPhoneUseCaseResponse {
  id: string;
  companyId: string;
  phone: string;
  type: string;
  isDefault: boolean;
}
