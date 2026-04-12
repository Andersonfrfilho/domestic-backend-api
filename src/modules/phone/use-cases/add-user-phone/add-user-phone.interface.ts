import { UserPhone } from '@modules/shared/providers/database/entities/user-phone.entity';

export interface AddUserPhoneUseCaseParams {
  userId: string;
  number: string;
  type?: string;
  label?: string;
  isPrimary?: boolean;
}

export interface AddUserPhoneUseCaseResponse extends UserPhone {}

export interface AddUserPhoneUseCaseInterface {
  execute(params: AddUserPhoneUseCaseParams): Promise<AddUserPhoneUseCaseResponse>;
}
