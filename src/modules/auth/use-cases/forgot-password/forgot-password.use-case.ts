import { KEYCLOAK_ADMIN_CLIENT, KeycloakAdminClient } from '@adatechnology/nestjs-keycloak-admin';
import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import type {
  ForgotPasswordParams,
  ForgotPasswordUseCaseInterface,
} from './forgot-password.interface';

export const FORGOT_PASSWORD_LOG_MESSAGES = {
  START_FLOW: 'Starting forgot password flow',
  USER_NOT_FOUND: 'User not found for password reset',
  RESET_TRIGGERED: 'Password reset email triggered',
  RESET_FAILED: 'Failed to trigger password reset',
  SUCCESS: 'Password reset email sent successfully',
} as const;

@Injectable()
export class ForgotPasswordUseCase implements ForgotPasswordUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
    @Inject(KEYCLOAK_ADMIN_CLIENT)
    private readonly keycloakAdmin: KeycloakAdminClient,
  ) {}

  @TraceMethod()
  async execute(params: ForgotPasswordParams): Promise<void> {
    this.logProvider.info({
      message: FORGOT_PASSWORD_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { email: params.email },
    });

    try {
      const { accessToken } = await this.keycloakAdmin.getAdminToken();
      const baseUrl = process.env.KEYCLOAK_BASE_URL || 'http://keycloak:8080';
      const realm = process.env.KEYCLOAK_REALM || 'domestic';

      // 1. Find user by email
      const searchUrl = `${baseUrl}/admin/realms/${realm}/users?email=${encodeURIComponent(params.email)}&exact=true`;
      const searchResponse = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!searchResponse.ok) {
        throw new Error(`Failed to search user: ${searchResponse.status}`);
      }

      const users = await searchResponse.json();
      if (!Array.isArray(users) || users.length === 0) {
        this.logProvider.warn({
          message: FORGOT_PASSWORD_LOG_MESSAGES.USER_NOT_FOUND,
          context: this.logContext,
          meta: { email: params.email },
        });
        throw new NotFoundException('Usuário não encontrado');
      }

      const userId = users[0].id;

      // 2. Trigger password reset email
      const resetUrl = `${baseUrl}/admin/realms/${realm}/users/${userId}/execute-actions-email`;
      const resetResponse = await fetch(resetUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['UPDATE_PASSWORD']),
      });

      if (!resetResponse.ok) {
        this.logProvider.error({
          message: FORGOT_PASSWORD_LOG_MESSAGES.RESET_FAILED,
          context: this.logContext,
          meta: { email: params.email, userId, status: resetResponse.status },
        });
        throw new Error(`Failed to trigger password reset: ${resetResponse.status}`);
      }

      this.logProvider.info({
        message: FORGOT_PASSWORD_LOG_MESSAGES.SUCCESS,
        context: this.logContext,
        meta: { email: params.email, userId },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logProvider.error({
        message: FORGOT_PASSWORD_LOG_MESSAGES.RESET_FAILED,
        context: this.logContext,
        meta: {
          email: params.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }
}
