import { Email } from '@modules/shared/providers/database/entities/email.entity';

export interface CreateEmailParams {
  email: string;
}

export interface EmailRepositoryInterface {
  create(params: CreateEmailParams): Promise<Email>;
  findById(id: string): Promise<Email | null>;
  findByEmail(email: string): Promise<Email | null>;
  update(id: string, params: Partial<Pick<Email, 'isVerified'>>): Promise<Email>;
  delete(id: string): Promise<void>;
}
