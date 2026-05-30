import { UserPhone } from '@modules/shared/providers/database/entities/user-phone.entity';

export interface CreateUserPhoneParams {
  userId: string;
  phoneId: string;
  label?: string;
  isPrimary?: boolean;
}

export interface UserPhoneRepositoryInterface {
  create(params: CreateUserPhoneParams): Promise<UserPhone>;
  findById(id: string): Promise<UserPhone | null>;
  findByUserId(userId: string): Promise<UserPhone[]>;
  findByUserIdAndPhoneId(userId: string, phoneId: string): Promise<UserPhone | null>;
  updateIsPrimary(id: string, isPrimary: boolean): Promise<void>;
  delete(id: string): Promise<void>;
}
