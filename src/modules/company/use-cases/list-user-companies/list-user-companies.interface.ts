export interface ListUserCompaniesUseCaseInterface {
  execute(params: ListUserCompaniesUseCaseParams): Promise<ListUserCompaniesUseCaseResponse>;
}

export interface ListUserCompaniesUseCaseParams {
  userId: string;
}

export interface ListUserCompaniesUseCaseResponse {
  companies: Array<{
    id: string;
    document: string;
    companyName: string;
    tradeName: string | null;
    email: string;
    phone: string;
    status: string;
    role: string;
  }>;
}
