import { UserPhone } from '@modules/shared/providers/database/entities/user-phone.entity';

export interface VerifyPhoneCodeUseCaseParams {
  userId: string;
  userPhoneId: string;
  code: string;
}

export interface VerifyPhoneCodeUseCaseResponse extends UserPhone {}

export interface VerifyPhoneCodeUseCaseInterface {
  execute(params: VerifyPhoneCodeUseCaseParams): Promise<VerifyPhoneCodeUseCaseResponse>;
}
