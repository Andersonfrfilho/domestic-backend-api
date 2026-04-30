export interface LookupCepResponse {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  lat: number | null;
  lng: number | null;
}

export interface LookupCepUseCaseInterface {
  execute(cep: string): Promise<LookupCepResponse>;
}
