import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { UserPhone } from '@modules/shared/providers/database/entities/user-phone.entity';
import { type UserServiceInterface } from '@modules/user/use-cases/create-users/create-user.interface';
import { USER_SERVICE_PROVIDE } from '@modules/user/user.token';

import { PHONE_SERVICE_LOG_MESSAGES } from './phone.service.constants';
import { AddPhoneByKeycloakParams, PhoneServiceInterface } from './phone.service.interface';
import {
  ADD_USER_PHONE_USE_CASE_PROVIDE,
  LIST_USER_PHONES_USE_CASE_PROVIDE,
  REMOVE_USER_PHONE_USE_CASE_PROVIDE,
  SEND_PHONE_VERIFICATION_USE_CASE_PROVIDE,
  VERIFY_PHONE_CODE_USE_CASE_PROVIDE,
} from './phone.token';
import { type AddUserPhoneUseCaseInterface } from './use-cases/add-user-phone/add-user-phone.interface';
import { type ListUserPhonesUseCaseInterface } from './use-cases/list-user-phones/list-user-phones.interface';
import { type RemoveUserPhoneUseCaseInterface } from './use-cases/remove-user-phone/remove-user-phone.interface';
import { type SendPhoneVerificationUseCaseInterface } from './use-cases/send-phone-verification/send-phone-verification.interface';
import { type VerifyPhoneCodeUseCaseInterface } from './use-cases/verify-phone-code/verify-phone-code.interface';

@Injectable()
export class PhoneService implements PhoneServiceInterface {
  @TraceMethod()
  private readonly logContext = this.constructor.name;

  constructor(
    @Inject(USER_SERVICE_PROVIDE)
    private readonly userService: UserServiceInterface,
    @Inject(ADD_USER_PHONE_USE_CASE_PROVIDE)
    private readonly addUserPhoneUseCase: AddUserPhoneUseCaseInterface,
    @Inject(LIST_USER_PHONES_USE_CASE_PROVIDE)
    private readonly listUserPhonesUseCase: ListUserPhonesUseCaseInterface,
    @Inject(REMOVE_USER_PHONE_USE_CASE_PROVIDE)
    private readonly removeUserPhoneUseCase: RemoveUserPhoneUseCaseInterface,
    @Inject(SEND_PHONE_VERIFICATION_USE_CASE_PROVIDE)
    private readonly sendPhoneVerificationUseCase: SendPhoneVerificationUseCaseInterface,
    @Inject(VERIFY_PHONE_CODE_USE_CASE_PROVIDE)
    private readonly verifyPhoneCodeUseCase: VerifyPhoneCodeUseCaseInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async listUserPhonesByKeycloakId(keycloakId: string): Promise<UserPhone[]> {
    this.logProvider.info({
      message: PHONE_SERVICE_LOG_MESSAGES.LIST_PHONES_BY_KEYCLOAK_START,
      context: `${this.logContext}.listUserPhonesByKeycloakId`,
      meta: { keycloakId },
    });

    const user = await this.userService.getUserByKeycloakId(keycloakId);
    const phones = await this.listUserPhonesUseCase.execute({ userId: user.id });

    this.logProvider.info({
      message: PHONE_SERVICE_LOG_MESSAGES.LIST_PHONES_BY_KEYCLOAK_SUCCESS,
      context: `${this.logContext}.listUserPhonesByKeycloakId`,
      meta: { keycloakId, userId: user.id, phonesCount: phones.length },
    });

    return phones;
  }

  async addUserPhoneByKeycloakId(
    keycloakId: string,
    params: AddPhoneByKeycloakParams,
  ): Promise<UserPhone> {
    this.logProvider.info({
      message: PHONE_SERVICE_LOG_MESSAGES.ADD_PHONE_BY_KEYCLOAK_START,
      context: `${this.logContext}.addUserPhoneByKeycloakId`,
      meta: { keycloakId },
    });

    const user = await this.userService.getUserByKeycloakId(keycloakId);
    const userPhone = await this.addUserPhoneUseCase.execute({ ...params, userId: user.id });

    this.logProvider.info({
      message: PHONE_SERVICE_LOG_MESSAGES.ADD_PHONE_BY_KEYCLOAK_SUCCESS,
      context: `${this.logContext}.addUserPhoneByKeycloakId`,
      meta: { keycloakId, userId: user.id, userPhoneId: userPhone.id },
    });

    return userPhone;
  }

  async removeUserPhoneByKeycloakId(keycloakId: string, userPhoneId: string): Promise<void> {
    this.logProvider.info({
      message: PHONE_SERVICE_LOG_MESSAGES.REMOVE_PHONE_BY_KEYCLOAK_START,
      context: `${this.logContext}.removeUserPhoneByKeycloakId`,
      meta: { keycloakId, userPhoneId },
    });

    const user = await this.userService.getUserByKeycloakId(keycloakId);
    await this.removeUserPhoneUseCase.execute({ userId: user.id, userPhoneId });

    this.logProvider.info({
      message: PHONE_SERVICE_LOG_MESSAGES.REMOVE_PHONE_BY_KEYCLOAK_SUCCESS,
      context: `${this.logContext}.removeUserPhoneByKeycloakId`,
      meta: { keycloakId, userId: user.id, userPhoneId },
    });
  }

  async sendPhoneVerificationByKeycloakId(keycloakId: string, userPhoneId: string): Promise<void> {
    this.logProvider.info({
      message: PHONE_SERVICE_LOG_MESSAGES.SEND_VERIFICATION_BY_KEYCLOAK_START,
      context: `${this.logContext}.sendPhoneVerificationByKeycloakId`,
      meta: { keycloakId, userPhoneId },
    });

    const user = await this.userService.getUserByKeycloakId(keycloakId);
    await this.sendPhoneVerificationUseCase.execute({ userId: user.id, userPhoneId });

    this.logProvider.info({
      message: PHONE_SERVICE_LOG_MESSAGES.SEND_VERIFICATION_BY_KEYCLOAK_SUCCESS,
      context: `${this.logContext}.sendPhoneVerificationByKeycloakId`,
      meta: { keycloakId, userId: user.id, userPhoneId },
    });
  }

  async verifyPhoneCodeByKeycloakId(
    keycloakId: string,
    userPhoneId: string,
    code: string,
  ): Promise<UserPhone> {
    this.logProvider.info({
      message: PHONE_SERVICE_LOG_MESSAGES.VERIFY_CODE_BY_KEYCLOAK_START,
      context: `${this.logContext}.verifyPhoneCodeByKeycloakId`,
      meta: { keycloakId, userPhoneId },
    });

    const user = await this.userService.getUserByKeycloakId(keycloakId);
    const userPhone = await this.verifyPhoneCodeUseCase.execute({
      userId: user.id,
      userPhoneId,
      code,
    });

    this.logProvider.info({
      message: PHONE_SERVICE_LOG_MESSAGES.VERIFY_CODE_BY_KEYCLOAK_SUCCESS,
      context: `${this.logContext}.verifyPhoneCodeByKeycloakId`,
      meta: { keycloakId, userId: user.id, userPhoneId },
    });

    return userPhone;
  }
}
