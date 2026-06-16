import { ProviderFullDetails } from '../../provider.repository';

export interface GetProviderByIdUseCaseParams {
  id: string;
}

export type GetProviderByIdUseCaseResponse = ProviderFullDetails;

export interface GetProviderByIdUseCaseInterface {
  execute(params: GetProviderByIdUseCaseParams): Promise<GetProviderByIdUseCaseResponse>;
}
