import { UserEmail } from '@modules/shared/providers/database/entities/user-email.entity';

export interface AddUserEmailUseCaseParams {
  userId: string;
  email: string;
  label?: string;
  isPrimary?: boolean;
}

export interface AddUserEmailUseCaseResponse extends UserEmail {}

export interface AddUserEmailUseCaseInterface {
  execute(params: AddUserEmailUseCaseParams): Promise<AddUserEmailUseCaseResponse>;
}
