import { KeycloakModule } from '@adatechnology/auth-keycloak';
import { Module } from '@nestjs/common';

import { buildKeycloakConfigFromEnv } from '@config/keycloak.config';

import { SharedInterceptorsModule } from './interceptors/interceptors.module';
import { SharedProviderModule } from './providers/provider.module';

@Module({
  imports: [
    SharedProviderModule,

    KeycloakModule.forRoot(buildKeycloakConfigFromEnv()),
    SharedInterceptorsModule,
  ],
  exports: [SharedProviderModule, KeycloakModule],
})
export class SharedModule {}
