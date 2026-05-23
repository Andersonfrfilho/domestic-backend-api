import { CacheModule } from '@adatechnology/cache';
import { HttpModule } from '@adatechnology/http-client';
import { KeycloakAdminModule } from '@adatechnology/keycloak-admin';
import {
  HTTP_LOGGING_INTERCEPTOR,
  LoggerModule,
  RequestContextMiddleware,
} from '@adatechnology/logger';
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
      level: process.env.LOG_LEVEL || 'info',
      interceptorExcludedPaths: ['/health', '/metrics'],
    }),
    CacheModule.forRoot({ isGlobal: true, excludedDebugKeys: ['health:*', 'metrics:*'] }),
    HttpModule.forRoot({}),
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
