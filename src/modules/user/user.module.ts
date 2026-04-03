import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@modules/shared/domain/entities/user.entity';
import { SharedModule } from '@modules/shared/shared.module';

import { CONNECTIONS_NAMES } from '../shared/infrastructure/providers/database/database.constant';

import { UserApplicationCreateUseCase } from './application/use-cases/create-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { FindUserByIdUseCase } from './application/use-cases/find-user-by-id.use-case';
import { FindUserByKeycloakIdUseCase } from './application/use-cases/find-user-by-keycloak-id.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { UserController } from './infrastructure/user.controller';
import { UserRepository } from './infrastructure/user.repository';
import { UserService } from './infrastructure/user.service';
import {
  USER_CREATE_USE_CASE_PROVIDE,
  FIND_USER_BY_ID_USE_CASE_PROVIDE,
  FIND_USER_BY_KEYCLOAK_ID_USE_CASE_PROVIDE,
  UPDATE_USER_USE_CASE_PROVIDE,
  DELETE_USER_USE_CASE_PROVIDE,
  USER_REPOSITORY_PROVIDE,
  USER_SERVICE_PROVIDE,
} from './infrastructure/user.token';

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
      provide: FIND_USER_BY_ID_USE_CASE_PROVIDE,
      useClass: FindUserByIdUseCase,
    },
    {
      provide: FIND_USER_BY_KEYCLOAK_ID_USE_CASE_PROVIDE,
      useClass: FindUserByKeycloakIdUseCase,
    },
    {
      provide: UPDATE_USER_USE_CASE_PROVIDE,
      useClass: UpdateUserUseCase,
    },
    {
      provide: DELETE_USER_USE_CASE_PROVIDE,
      useClass: DeleteUserUseCase,
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
    FIND_USER_BY_ID_USE_CASE_PROVIDE,
    FIND_USER_BY_KEYCLOAK_ID_USE_CASE_PROVIDE,
    UPDATE_USER_USE_CASE_PROVIDE,
    DELETE_USER_USE_CASE_PROVIDE,
  ],
})
export class UserModule {}
