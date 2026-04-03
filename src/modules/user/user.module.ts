import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@modules/shared/providers/database/entities/user.entity';
import { SharedModule } from '@modules/shared/shared.module';

import { CONNECTIONS_NAMES } from '../shared/providers/database/database.constant';

import { UserApplicationCreateUseCase } from './use-cases/create-users/create-user.use-case';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import {
  USER_CREATE_USE_CASE_PROVIDE,
  USER_REPOSITORY_PROVIDE,
  USER_SERVICE_PROVIDE,
} from './user.token';

@Module({
  imports: [TypeOrmModule.forFeature([User], CONNECTIONS_NAMES.POSTGRES), SharedModule],
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
  exports: [USER_REPOSITORY_PROVIDE, USER_SERVICE_PROVIDE, USER_CREATE_USE_CASE_PROVIDE],
})
export class UserModule {}
