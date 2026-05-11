import { Phone } from '@modules/shared/providers/database/entities/phone.entity';

export interface CreatePhoneParams {
  number: string;
  type?: string;
}

export interface PhoneRepositoryInterface {
  create(params: CreatePhoneParams): Promise<Phone>;
  findById(id: string): Promise<Phone | null>;
  findByNumber(number: string): Promise<Phone | null>;
  delete(id: string): Promise<void>;
}
