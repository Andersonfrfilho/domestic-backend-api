import { CacheModule } from '@adatechnology/cache';
import { HttpModule } from '@adatechnology/http-client';
import { LoggerModule, RequestContextMiddleware } from '@adatechnology/logger';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { register as tsConfigPathsRegister } from 'tsconfig-paths';

import { ConfigModule } from '@config/config.module';
import { ErrorModule } from '@modules/error/error.module';
import { HealthModule } from '@modules/health/health.module';

import * as tsConfig from '../tsconfig.json';

import { SharedModule } from './modules/shared/shared.module';
import { UserModule } from './modules/user/user.module';
import { CategoryModule } from './modules/category/category.module';
import { ServiceModule } from './modules/service/service.module';
import { ProviderModule } from './modules/provider/provider.module';
import { ServiceRequestModule } from './modules/service-request/service-request.module';
import { ReviewModule } from './modules/review/review.module';
import { NotificationModule } from './modules/notification/notification.module';
import { DocumentModule } from './modules/document/document.module';

const compilerOptions = tsConfig.compilerOptions;

tsConfigPathsRegister({
  baseUrl: compilerOptions.baseUrl,
  paths: compilerOptions.paths,
});

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRoot({ level: process.env.LOG_LEVEL || 'info' }),
    CacheModule.forRoot({ isGlobal: true }),
    HttpModule.forRoot({}, { provide: 'HTTP_PROVIDER' }),
    SharedModule,
    ErrorModule,
    HealthModule,
    UserModule,
    CategoryModule,
    ServiceModule,
    ProviderModule,
    ServiceRequestModule,
    ReviewModule,
    NotificationModule,
    DocumentModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
