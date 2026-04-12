import { BaseErrorFactory } from '@modules/error/factories';

export enum PhoneErrorCode {
  INVALID_FORMAT = 'INVALID_PHONE_FORMAT',
  NOT_FOUND = 'PHONE_NOT_FOUND',
  USER_PHONE_NOT_FOUND = 'USER_PHONE_NOT_FOUND',
  ALREADY_VERIFIED = 'PHONE_ALREADY_VERIFIED',
  INVALID_CODE = 'PHONE_INVALID_CODE',
  CODE_EXPIRED = 'PHONE_CODE_EXPIRED',
  ALREADY_EXISTS = 'PHONE_ALREADY_EXISTS',
}

const PHONE_ERROR_CONFIGS = {
  invalidFormat: (phone?: string) => ({
    message: `Invalid phone format${phone ? `: ${phone}` : ''}`,
    code: PhoneErrorCode.INVALID_FORMAT,
    details: { phone },
  }),

  notFound: (phoneId?: string) => ({
    message: 'Phone not found',
    code: PhoneErrorCode.NOT_FOUND,
    details: { phoneId },
  }),

  userPhoneNotFound: (userPhoneId?: string) => ({
    message: 'User phone not found',
    code: PhoneErrorCode.USER_PHONE_NOT_FOUND,
    details: { userPhoneId },
  }),

  alreadyVerified: (phoneId?: string) => ({
    message: 'Phone is already verified',
    code: PhoneErrorCode.ALREADY_VERIFIED,
    details: { phoneId },
  }),

  invalidCode: () => ({
    message: 'Invalid or expired verification code',
    code: PhoneErrorCode.INVALID_CODE,
    details: {},
  }),

  alreadyExists: (number?: string) => ({
    message: `Phone number already registered${number ? `: ${number}` : ''}`,
    code: PhoneErrorCode.ALREADY_EXISTS,
    details: { number },
  }),
} as const;

export class PhoneErrorFactory extends BaseErrorFactory {
  static invalidFormat(phone?: string) {
    return this.createValidation(PHONE_ERROR_CONFIGS.invalidFormat(phone));
  }

  static notFound(phoneId?: string) {
    return this.createNotFound(PHONE_ERROR_CONFIGS.notFound(phoneId));
  }

  static userPhoneNotFound(userPhoneId?: string) {
    return this.createNotFound(PHONE_ERROR_CONFIGS.userPhoneNotFound(userPhoneId));
  }

  static alreadyVerified(phoneId?: string) {
    return this.createConflict(PHONE_ERROR_CONFIGS.alreadyVerified(phoneId));
  }

  static invalidCode() {
    return this.createValidation(PHONE_ERROR_CONFIGS.invalidCode());
  }

  static alreadyExists(number?: string) {
    return this.createConflict(PHONE_ERROR_CONFIGS.alreadyExists(number));
  }
}
