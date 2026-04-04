import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@modules/shared/providers/database/entities/user.entity';
import { SharedModule } from '@modules/shared/shared.module';

import { CONNECTIONS_NAMES } from '../shared/providers/database/database.constant';

import { UserApplicationCreateUseCase } from './use-cases/create-users/create-user.use-case';
import { DeleteUserUseCase } from './use-cases/delete-user/delete-user.use-case';
import { GetUserByIdUseCase } from './use-cases/get-user-by-id/get-user-by-id.use-case';
import { GetUserByKeycloakIdUseCase } from './use-cases/get-user-by-keycloak-id/get-user-by-keycloak-id.use-case';
import { UpdateUserUseCase } from './use-cases/update-user/update-user.use-case';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import {
  USER_CREATE_USE_CASE_PROVIDE,
  USER_DELETE_USE_CASE_PROVIDE,
  USER_GET_BY_ID_USE_CASE_PROVIDE,
  USER_GET_BY_KEYCLOAK_ID_USE_CASE_PROVIDE,
  USER_REPOSITORY_PROVIDE,
  USER_SERVICE_PROVIDE,
  USER_UPDATE_USE_CASE_PROVIDE,
} from './user.token';

@Module({
  imports: [TypeOrmModule.forFeature([User], CONNECTIONS_NAMES.POSTGRES), SharedModule],
  controllers: [UserController],
  providers: [
    { provide: USER_REPOSITORY_PROVIDE, useClass: UserRepository },
    { provide: USER_CREATE_USE_CASE_PROVIDE, useClass: UserApplicationCreateUseCase },
    { provide: USER_GET_BY_ID_USE_CASE_PROVIDE, useClass: GetUserByIdUseCase },
    { provide: USER_GET_BY_KEYCLOAK_ID_USE_CASE_PROVIDE, useClass: GetUserByKeycloakIdUseCase },
    { provide: USER_UPDATE_USE_CASE_PROVIDE, useClass: UpdateUserUseCase },
    { provide: USER_DELETE_USE_CASE_PROVIDE, useClass: DeleteUserUseCase },
    { provide: USER_SERVICE_PROVIDE, useClass: UserService },
  ],
  exports: [USER_REPOSITORY_PROVIDE, USER_SERVICE_PROVIDE],
})
export class UserModule {}
