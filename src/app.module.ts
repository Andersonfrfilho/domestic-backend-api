import { CacheModule } from '@adatechnology/nestjs-cache';
import { HttpModule } from '@adatechnology/nestjs-http-client';
import { KeycloakAdminModule } from '@adatechnology/nestjs-keycloak-admin';
import {
  HTTP_LOGGING_INTERCEPTOR,
  LoggerModule,
  REQUEST_ID_FORMAT,
  RequestContextMiddleware,
} from '@adatechnology/nestjs-logger';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { register as tsConfigPathsRegister } from 'tsconfig-paths';

import { ConfigModule } from '@config/config.module';
import { ErrorModule } from '@modules/error/error.module';
import { HealthModule } from '@modules/health/health.module';
import { MetricsModule } from '@modules/metrics/metrics.module';

import * as tsConfig from '../tsconfig.json';

import { AccountBlockModule } from './modules/account-block/account-block.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/category/category.module';
import { CompanyModule } from './modules/company/company.module';
import { DeviceTokenModule } from './modules/device-token/device-token.module';
import { DocumentModule } from './modules/document/document.module';
import { EmailModule } from './modules/email/email.module';
import { NotificationModule } from './modules/notification/notification.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { PhoneModule } from './modules/phone/phone.module';
import { ProviderModule } from './modules/provider/provider.module';
import { ReviewModule } from './modules/review/review.module';
import { ServiceModule } from './modules/service/service.module';
import { ServiceRequestModule } from './modules/service-request/service-request.module';
import { SharedModule } from './modules/shared/shared.module';
import { UserModule } from './modules/user/user.module';

const compilerOptions = tsConfig.compilerOptions;

tsConfigPathsRegister({
  baseUrl: compilerOptions.baseUrl,
  paths: compilerOptions.paths,
});

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useExisting: HTTP_LOGGING_INTERCEPTOR,
    },
  ],
  imports: [
    MetricsModule,
    ConfigModule,
    LoggerModule.forRoot({
      enableTraceStack: true,
      requestIdFormat: REQUEST_ID_FORMAT.SHORT_HASH,
      colorize: process.stdout.isTTY,
      isProduction: false,
      appName: 'backend-api',
      appVersion: '0.0.1',
      level: process.env.LOG_LEVEL || 'info',
      interceptorExcludedPaths: ['/health', '/metrics'],
    }),
    CacheModule.forRoot({ isGlobal: true, excludedDebugKeys: ['health:*', 'metrics:*'] }),
    HttpModule.forRoot({
      logging: {
        enabled: true,
        environments: ['development', 'test', 'staging', 'production'],
      },
    }),
    KeycloakAdminModule.forRoot({
      baseUrl: process.env.KEYCLOAK_BASE_URL || 'http://keycloak:8080',
      realm: process.env.KEYCLOAK_REALM || 'domestic',
      adminUser: process.env.KEYCLOAK_ADMIN_USER || 'admin',
      adminPassword: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
    }),
    SharedModule,
    ErrorModule,
    HealthModule,
    UserModule,
    PhoneModule,
    EmailModule,
    CategoryModule,
    ServiceModule,
    ProviderModule,
    ServiceRequestModule,
    ReviewModule,
    NotificationModule,
    DeviceTokenModule,
    DocumentModule,
    AuthModule,
    CompanyModule,
    OnboardingModule,
    AccountBlockModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
