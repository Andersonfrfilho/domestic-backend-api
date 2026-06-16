import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable } from '@nestjs/common';

import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import type { LogoutParams } from './logout.interface';

@Injectable()
export class LogoutUseCase {
  private readonly baseUrl = process.env.KEYCLOAK_BASE_URL || 'http://keycloak:8080';
  private readonly realm = process.env.KEYCLOAK_REALM || 'domestic-backend';
  private readonly clientId = process.env.KEYCLOAK_BFF_CLIENT_ID || 'domestic-backend-bff';
  private readonly clientSecret =
    process.env.KEYCLOAK_BFF_CLIENT_SECRET || 'backend-bff-client-secret';

  constructor(
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute({ refreshToken }: LogoutParams): Promise<void> {
    const url = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/logout`;
    const body = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      if (!response.ok) {
        this.logProvider.warn({
          message: `Keycloak logout returned ${response.status} (non-fatal)`,
          context: `${this.constructor.name}.execute`,
        });
      }
    } catch (error) {
      this.logProvider.warn({
        message: `Keycloak logout failed (non-fatal): ${error instanceof Error ? error.message : 'Unknown error'}`,
        context: `${this.constructor.name}.execute`,
      });
    }
  }
}
