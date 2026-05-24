import { KEYCLOAK_ADMIN_CLIENT, KeycloakAdminClient } from '@adatechnology/keycloak-admin';
import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { ConflictException, Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import type { EmailRepositoryInterface } from '@modules/email/email.repository.interface';
import { EMAIL_REPOSITORY_PROVIDE } from '@modules/email/email.token';

export interface CheckEmailExistsParams {
  email: string;
}

export const CHECK_EMAIL_EXISTS_LOG_MESSAGES = {
  START_FLOW: 'Starting check email exists flow',
  KEYCLOAK_EXISTS: 'Email already registered in Keycloak',
  LOCAL_EXISTS: 'Email already registered locally',
  SUCCESS: 'Email is available',
} as const;

@Injectable()
export class CheckEmailExistsUseCase {
  @TraceMethod()
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(EMAIL_REPOSITORY_PROVIDE)
    private readonly emailRepository: EmailRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
    @Inject(KEYCLOAK_ADMIN_CLIENT)
    private readonly keycloakAdmin: KeycloakAdminClient,
  ) {}

  async execute(params: CheckEmailExistsParams): Promise<void> {
    this.logProvider.info({
      message: CHECK_EMAIL_EXISTS_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { email: params.email },
    });

    // 1. Verifica no Keycloak
    try {
      const { accessToken } = await this.keycloakAdmin.getAdminToken();
      const url = `${process.env.KEYCLOAK_BASE_URL || 'http://keycloak:8080'}/admin/realms/${process.env.KEYCLOAK_REALM || 'domestic'}/users?email=${encodeURIComponent(params.email)}&exact=true`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const users = await response.json();
        if (Array.isArray(users) && users.length > 0) {
          this.logProvider.warn({
            message: CHECK_EMAIL_EXISTS_LOG_MESSAGES.KEYCLOAK_EXISTS,
            context: this.logContext,
            meta: { email: params.email, keycloakId: users[0].id },
          });
          throw new ConflictException('E-mail já está em uso');
        }
      }
    } catch (err: any) {
      if (err instanceof ConflictException) throw err;
      this.logProvider.warn({
        message: 'Keycloak email check failed, falling back to local check',
        context: this.logContext,
      });
    }

    // 2. Verifica no banco local
    const email = await this.emailRepository.findByEmail(params.email);
    if (email) {
      this.logProvider.warn({
        message: CHECK_EMAIL_EXISTS_LOG_MESSAGES.LOCAL_EXISTS,
        context: this.logContext,
        meta: { email: params.email },
      });
      throw new ConflictException('E-mail já está em uso');
    }

    this.logProvider.info({
      message: CHECK_EMAIL_EXISTS_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { email: params.email },
    });
  }
}
