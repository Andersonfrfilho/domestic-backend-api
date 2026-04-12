import { BaseErrorFactory } from '@modules/error/factories';

export enum EmailErrorCode {
  NOT_FOUND = 'EMAIL_NOT_FOUND',
  USER_EMAIL_NOT_FOUND = 'USER_EMAIL_NOT_FOUND',
  ALREADY_VERIFIED = 'EMAIL_ALREADY_VERIFIED',
  INVALID_CODE = 'EMAIL_INVALID_CODE',
  ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
}

const EMAIL_ERROR_CONFIGS = {
  notFound: (emailId?: string) => ({
    message: 'Email not found',
    code: EmailErrorCode.NOT_FOUND,
    details: { emailId },
  }),

  userEmailNotFound: (userEmailId?: string) => ({
    message: 'User email not found',
    code: EmailErrorCode.USER_EMAIL_NOT_FOUND,
    details: { userEmailId },
  }),

  alreadyVerified: (emailId?: string) => ({
    message: 'Email is already verified',
    code: EmailErrorCode.ALREADY_VERIFIED,
    details: { emailId },
  }),

  invalidCode: () => ({
    message: 'Invalid or expired verification code',
    code: EmailErrorCode.INVALID_CODE,
    details: {},
  }),

  alreadyExists: (email?: string) => ({
    message: `Email already registered${email ? `: ${email}` : ''}`,
    code: EmailErrorCode.ALREADY_EXISTS,
    details: { email },
  }),
} as const;

export class EmailErrorFactory extends BaseErrorFactory {
  static notFound(emailId?: string) {
    return this.createNotFound(EMAIL_ERROR_CONFIGS.notFound(emailId));
  }

  static userEmailNotFound(userEmailId?: string) {
    return this.createNotFound(EMAIL_ERROR_CONFIGS.userEmailNotFound(userEmailId));
  }

  static alreadyVerified(emailId?: string) {
    return this.createConflict(EMAIL_ERROR_CONFIGS.alreadyVerified(emailId));
  }

  static invalidCode() {
    return this.createValidation(EMAIL_ERROR_CONFIGS.invalidCode());
  }

  static alreadyExists(email?: string) {
    return this.createConflict(EMAIL_ERROR_CONFIGS.alreadyExists(email));
  }
}
