export interface GetCompanyDetailsUseCaseInterface {
  execute(params: GetCompanyDetailsUseCaseParams): Promise<GetCompanyDetailsUseCaseResponse>;
}

export interface GetCompanyDetailsUseCaseParams {
  companyId: string;
}

export interface GetCompanyDetailsUseCaseResponse {
  id: string;
  document: string;
  companyName: string;
  tradeName: string | null;
  email: string;
  phone: string;
  status: string;
  addresses: Array<{
    id: string;
    type: string;
    zipCode: string;
    street: string;
    number: string;
    city: string;
    state: string;
    isDefault: boolean;
  }>;
  emails: Array<{
    id: string;
    email: string;
    type: string;
    isDefault: boolean;
  }>;
  phones: Array<{
    id: string;
    phone: string;
    type: string;
    isDefault: boolean;
  }>;
  businessHours: Array<{
    id: string;
    dayOfWeek: number;
    isOpen: boolean;
    openTime: string | null;
    closeTime: string | null;
  }>;
  members: Array<{
    id: string;
    userId: string;
    role: string;
    status: string;
  }>;
  providers: Array<{
    id: string;
    providerId: string;
    role: string;
    status: string;
  }>;
}
