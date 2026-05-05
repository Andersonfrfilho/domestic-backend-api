import {
  B2BGuard,
  B2CGuard,
  BearerTokenGuard,
  KEYCLOAK_CLIENT,
} from '@adatechnology/auth-keycloak';
import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

const LOG_CONTEXT = 'ApiAuthGuard';

/**
 * Local implementation that explicitly wires all dependencies via @Inject tokens.
 * Required because @adatechnology/auth-keycloak is compiled without emitDecoratorMetadata,
 * so NestJS cannot auto-resolve constructor types for lib guards.
 * Registered via useFactory in UserModule to bypass class-token metadata scanning.
 */
@Injectable()
export class LocalApiAuthGuard implements CanActivate {
  private readonly b2bGuard: B2BGuard;
  private readonly b2cGuard: B2CGuard;

  constructor(
    @Inject(KEYCLOAK_CLIENT) keycloakClient: unknown,
    @Inject(LOGGER_PROVIDER) private readonly logger: LogProviderInterface,
  ) {
    const bearerTokenGuard = new BearerTokenGuard(keycloakClient as any, logger);
    this.b2cGuard = new B2CGuard();
    this.b2bGuard = new B2BGuard(bearerTokenGuard);

    this.logger.info({
      context: LOG_CONTEXT,
      message: 'LocalApiAuthGuard initialized',
      meta: {
        keycloakClient: (keycloakClient as any)?.constructor?.name ?? typeof keycloakClient,
        bearerTokenGuard: bearerTokenGuard?.constructor?.name,
        b2bGuard: this.b2bGuard?.constructor?.name,
        b2cGuard: this.b2cGuard?.constructor?.name,
      },
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const headers: Record<string, string> = request.headers ?? {};

    const xAccessToken = headers['x-access-token'];
    const authorization = headers['authorization'];

    this.logger.debug({
      context: LOG_CONTEXT,
      message: 'canActivate called',
      meta: {
        hasXAccessToken: !!xAccessToken,
        hasAuthorization: !!authorization,
        b2bGuardType: this.b2bGuard?.constructor?.name ?? typeof this.b2bGuard,
        b2cGuardType: this.b2cGuard?.constructor?.name ?? typeof this.b2cGuard,
      },
    });

    if (xAccessToken) {
      this.logger.debug({ context: LOG_CONTEXT, message: 'Routing to B2CGuard' });
      return this.b2cGuard.canActivate(context);
    }

    if (authorization?.toLowerCase().startsWith('bearer ')) {
      this.logger.debug({ context: LOG_CONTEXT, message: 'Routing to B2BGuard' });
      return this.b2bGuard.canActivate(context);
    }

    this.logger.warn({
      context: LOG_CONTEXT,
      message: 'No valid auth header found',
      meta: { headers: Object.keys(headers) },
    });

    throw new Error('Unauthorized: missing X-Access-Token (B2C) or Authorization (B2B)');
  }
}
