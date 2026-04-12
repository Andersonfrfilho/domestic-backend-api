import { UserPhone } from '@modules/shared/providers/database/entities/user-phone.entity';

export interface AddPhoneByKeycloakParams {
  number: string;
  type?: string;
  label?: string;
  isPrimary?: boolean;
}

export interface PhoneServiceInterface {
  listUserPhonesByKeycloakId(keycloakId: string): Promise<UserPhone[]>;
  addUserPhoneByKeycloakId(keycloakId: string, params: AddPhoneByKeycloakParams): Promise<UserPhone>;
  removeUserPhoneByKeycloakId(keycloakId: string, userPhoneId: string): Promise<void>;
  sendPhoneVerificationByKeycloakId(keycloakId: string, userPhoneId: string): Promise<void>;
  verifyPhoneCodeByKeycloakId(keycloakId: string, userPhoneId: string, code: string): Promise<UserPhone>;
}
