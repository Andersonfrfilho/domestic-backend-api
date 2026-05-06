export interface AddCompanyAddressUseCaseInterface {
  execute(params: AddCompanyAddressUseCaseParams): Promise<AddCompanyAddressUseCaseResponse>;
}

export interface AddCompanyAddressUseCaseParams {
  companyId: string;
  type: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault?: boolean;
}

export interface AddCompanyAddressUseCaseResponse {
  id: string;
  companyId: string;
  type: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
}
