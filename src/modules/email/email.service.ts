import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { UserEmail } from '@modules/shared/providers/database/entities/user-email.entity';
import { type UserServiceInterface } from '@modules/user/use-cases/create-users/create-user.interface';
import { USER_SERVICE_PROVIDE } from '@modules/user/user.token';

import { EMAIL_SERVICE_LOG_MESSAGES } from './email.service.constants';
import { AddEmailByKeycloakParams, EmailServiceInterface } from './email.service.interface';
import {
  ADD_USER_EMAIL_USE_CASE_PROVIDE,
  LIST_USER_EMAILS_USE_CASE_PROVIDE,
  REMOVE_USER_EMAIL_USE_CASE_PROVIDE,
  SEND_EMAIL_VERIFICATION_USE_CASE_PROVIDE,
  VERIFY_EMAIL_CODE_USE_CASE_PROVIDE,
} from './email.token';
import { type AddUserEmailUseCaseInterface } from './use-cases/add-user-email/add-user-email.interface';
import { type ListUserEmailsUseCaseInterface } from './use-cases/list-user-emails/list-user-emails.interface';
import { type RemoveUserEmailUseCaseInterface } from './use-cases/remove-user-email/remove-user-email.interface';
import { type SendEmailVerificationUseCaseInterface } from './use-cases/send-email-verification/send-email-verification.interface';
import { type VerifyEmailCodeUseCaseInterface } from './use-cases/verify-email-code/verify-email-code.interface';

@Injectable()
export class EmailService implements EmailServiceInterface {
  private readonly logContext = this.constructor.name;

  constructor(
    @Inject(USER_SERVICE_PROVIDE)
    private readonly userService: UserServiceInterface,
    @Inject(ADD_USER_EMAIL_USE_CASE_PROVIDE)
    private readonly addUserEmailUseCase: AddUserEmailUseCaseInterface,
    @Inject(LIST_USER_EMAILS_USE_CASE_PROVIDE)
    private readonly listUserEmailsUseCase: ListUserEmailsUseCaseInterface,
    @Inject(REMOVE_USER_EMAIL_USE_CASE_PROVIDE)
    private readonly removeUserEmailUseCase: RemoveUserEmailUseCaseInterface,
    @Inject(SEND_EMAIL_VERIFICATION_USE_CASE_PROVIDE)
    private readonly sendEmailVerificationUseCase: SendEmailVerificationUseCaseInterface,
    @Inject(VERIFY_EMAIL_CODE_USE_CASE_PROVIDE)
    private readonly verifyEmailCodeUseCase: VerifyEmailCodeUseCaseInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async listUserEmailsByKeycloakId(keycloakId: string): Promise<UserEmail[]> {
    this.logProvider.info({
      message: EMAIL_SERVICE_LOG_MESSAGES.LIST_EMAILS_BY_KEYCLOAK_START,
      context: `${this.logContext}.listUserEmailsByKeycloakId`,
      meta: { keycloakId },
    });

    const user = await this.userService.getUserByKeycloakId(keycloakId);
    const emails = await this.listUserEmailsUseCase.execute({ userId: user.id });

    this.logProvider.info({
      message: EMAIL_SERVICE_LOG_MESSAGES.LIST_EMAILS_BY_KEYCLOAK_SUCCESS,
      context: `${this.logContext}.listUserEmailsByKeycloakId`,
      meta: { keycloakId, userId: user.id, emailsCount: emails.length },
    });

    return emails;
  }

  async addUserEmailByKeycloakId(
    keycloakId: string,
    params: AddEmailByKeycloakParams,
  ): Promise<UserEmail> {
    this.logProvider.info({
      message: EMAIL_SERVICE_LOG_MESSAGES.ADD_EMAIL_BY_KEYCLOAK_START,
      context: `${this.logContext}.addUserEmailByKeycloakId`,
      meta: { keycloakId },
    });

    const user = await this.userService.getUserByKeycloakId(keycloakId);
    const userEmail = await this.addUserEmailUseCase.execute({ ...params, userId: user.id });

    this.logProvider.info({
      message: EMAIL_SERVICE_LOG_MESSAGES.ADD_EMAIL_BY_KEYCLOAK_SUCCESS,
      context: `${this.logContext}.addUserEmailByKeycloakId`,
      meta: { keycloakId, userId: user.id, userEmailId: userEmail.id },
    });

    return userEmail;
  }

  async removeUserEmailByKeycloakId(keycloakId: string, userEmailId: string): Promise<void> {
    this.logProvider.info({
      message: EMAIL_SERVICE_LOG_MESSAGES.REMOVE_EMAIL_BY_KEYCLOAK_START,
      context: `${this.logContext}.removeUserEmailByKeycloakId`,
      meta: { keycloakId, userEmailId },
    });

    const user = await this.userService.getUserByKeycloakId(keycloakId);
    await this.removeUserEmailUseCase.execute({ userId: user.id, userEmailId });

    this.logProvider.info({
      message: EMAIL_SERVICE_LOG_MESSAGES.REMOVE_EMAIL_BY_KEYCLOAK_SUCCESS,
      context: `${this.logContext}.removeUserEmailByKeycloakId`,
      meta: { keycloakId, userId: user.id, userEmailId },
    });
  }

  async sendEmailVerificationByKeycloakId(keycloakId: string, userEmailId: string): Promise<void> {
    this.logProvider.info({
      message: EMAIL_SERVICE_LOG_MESSAGES.SEND_VERIFICATION_BY_KEYCLOAK_START,
      context: `${this.logContext}.sendEmailVerificationByKeycloakId`,
      meta: { keycloakId, userEmailId },
    });

    const user = await this.userService.getUserByKeycloakId(keycloakId);
    await this.sendEmailVerificationUseCase.execute({ userId: user.id, userEmailId });

    this.logProvider.info({
      message: EMAIL_SERVICE_LOG_MESSAGES.SEND_VERIFICATION_BY_KEYCLOAK_SUCCESS,
      context: `${this.logContext}.sendEmailVerificationByKeycloakId`,
      meta: { keycloakId, userId: user.id, userEmailId },
    });
  }

  async verifyEmailCodeByKeycloakId(
    keycloakId: string,
    userEmailId: string,
    code: string,
  ): Promise<UserEmail> {
    this.logProvider.info({
      message: EMAIL_SERVICE_LOG_MESSAGES.VERIFY_CODE_BY_KEYCLOAK_START,
      context: `${this.logContext}.verifyEmailCodeByKeycloakId`,
      meta: { keycloakId, userEmailId },
    });

    const user = await this.userService.getUserByKeycloakId(keycloakId);
    const userEmail = await this.verifyEmailCodeUseCase.execute({
      userId: user.id,
      userEmailId,
      code,
    });

    this.logProvider.info({
      message: EMAIL_SERVICE_LOG_MESSAGES.VERIFY_CODE_BY_KEYCLOAK_SUCCESS,
      context: `${this.logContext}.verifyEmailCodeByKeycloakId`,
      meta: { keycloakId, userId: user.id, userEmailId },
    });

    return userEmail;
  }
}
