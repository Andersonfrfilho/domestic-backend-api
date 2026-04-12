import { UserPhone } from '@modules/shared/providers/database/entities/user-phone.entity';

export interface ListUserPhonesUseCaseParams {
  userId: string;
}

export type ListUserPhonesUseCaseResponse = UserPhone[];

export interface ListUserPhonesUseCaseInterface {
  execute(params: ListUserPhonesUseCaseParams): Promise<ListUserPhonesUseCaseResponse>;
}
