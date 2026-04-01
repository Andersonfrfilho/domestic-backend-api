import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@modules/shared/domain/entities/user.entity';
import { SharedModule } from '@modules/shared/shared.module';

import { CONNECTIONS_NAMES } from '../shared/infrastructure/providers/database/database.constant';

import { UserApplicationCreateUseCase } from './application/use-cases/create-user.use-case';
import { UserController } from './infrastructure/user.controller';
import { UserRepository } from './infrastructure/user.repository';
import { UserService } from './infrastructure/user.service';
import {
  USER_CREATE_USE_CASE_PROVIDE,
  USER_REPOSITORY_PROVIDE,
  USER_SERVICE_PROVIDE,
} from './infrastructure/user.token';

@Module({
  imports: [
    TypeOrmModule.forFeature([User], CONNECTIONS_NAMES.POSTGRES),
    SharedModule,
  ],
  controllers: [UserController],
  providers: [
    {
      provide: USER_REPOSITORY_PROVIDE,
      useClass: UserRepository,
    },
    {
      provide: USER_CREATE_USE_CASE_PROVIDE,
      useClass: UserApplicationCreateUseCase,
    },
    {
      provide: USER_SERVICE_PROVIDE,
      useClass: UserService,
    },
  ],
  exports: [
    USER_REPOSITORY_PROVIDE,
    USER_SERVICE_PROVIDE,
    USER_CREATE_USE_CASE_PROVIDE,
  ],
})
export class UserModule {}
