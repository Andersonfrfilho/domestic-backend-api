import { UserEmail } from '@modules/shared/providers/database/entities/user-email.entity';

export interface VerifyEmailCodeUseCaseParams {
  userId: string;
  userEmailId: string;
  code: string;
}

export interface VerifyEmailCodeUseCaseResponse extends UserEmail {}

export interface VerifyEmailCodeUseCaseInterface {
  execute(params: VerifyEmailCodeUseCaseParams): Promise<VerifyEmailCodeUseCaseResponse>;
}
