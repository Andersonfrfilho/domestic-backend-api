import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import type { TokenParams, TokenResult } from './token.interface';

@Injectable()
export class TokenUseCase {
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
  async execute(params: TokenParams): Promise<TokenResult> {
    const body = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    if ('grantType' in params && params.grantType === 'refresh_token') {
      body.set('grant_type', 'refresh_token');
      body.set('refresh_token', params.refreshToken);
    } else if ('username' in params) {
      body.set('grant_type', 'password');
      body.set('username', params.username);
      body.set('password', params.password);
    } else {
      throw new BadRequestException('Parâmetros inválidos para obtenção de token');
    }

    const url = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logProvider.warn({
        message: `Keycloak token request failed: ${response.status} ${error}`,
        context: `${this.constructor.name}.execute`,
      });
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      refreshExpiresIn: data.refresh_expires_in,
    };
  }
}
