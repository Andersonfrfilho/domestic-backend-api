import { UserEmail } from '@modules/shared/providers/database/entities/user-email.entity';

export interface AddEmailByKeycloakParams {
  email: string;
  label?: string;
  isPrimary?: boolean;
}

export interface EmailServiceInterface {
  listUserEmailsByKeycloakId(keycloakId: string): Promise<UserEmail[]>;
  addUserEmailByKeycloakId(keycloakId: string, params: AddEmailByKeycloakParams): Promise<UserEmail>;
  removeUserEmailByKeycloakId(keycloakId: string, userEmailId: string): Promise<void>;
  sendEmailVerificationByKeycloakId(keycloakId: string, userEmailId: string): Promise<void>;
  verifyEmailCodeByKeycloakId(keycloakId: string, userEmailId: string, code: string): Promise<UserEmail>;
}
