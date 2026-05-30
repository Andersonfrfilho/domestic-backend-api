import { UserEmail } from '@modules/shared/providers/database/entities/user-email.entity';

export interface CreateUserEmailParams {
  userId: string;
  emailId: string;
  label?: string;
  isPrimary?: boolean;
}

export interface UserEmailRepositoryInterface {
  create(params: CreateUserEmailParams): Promise<UserEmail>;
  findById(id: string): Promise<UserEmail | null>;
  findByUserId(userId: string): Promise<UserEmail[]>;
  findByUserIdAndEmailId(userId: string, emailId: string): Promise<UserEmail | null>;
  updateIsPrimary(id: string, isPrimary: boolean): Promise<void>;
  delete(id: string): Promise<void>;
}
