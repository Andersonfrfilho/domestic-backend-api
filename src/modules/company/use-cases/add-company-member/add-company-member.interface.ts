export interface AddCompanyMemberUseCaseInterface {
  execute(params: AddCompanyMemberUseCaseParams): Promise<AddCompanyMemberUseCaseResponse>;
}

export interface AddCompanyMemberUseCaseParams {
  companyId: string;
  userId: string;
  role: string;
}

export interface AddCompanyMemberUseCaseResponse {
  id: string;
  companyId: string;
  userId: string;
  role: string;
  status: string;
}
