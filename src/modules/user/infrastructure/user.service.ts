import { Inject, Injectable } from '@nestjs/common';

import { User } from '@modules/shared/domain/entities/user.entity';
import type {
  UserCreateUseCaseInterface,
  UserServiceInterface,
  UserServiceResponse,
  FindUserByIdUseCaseInterface,
  FindUserByKeycloakIdUseCaseInterface,
  UpdateUserUseCaseInterface,
  DeleteUserUseCaseInterface,
} from '@modules/user/application/interfaces/user.interface';
import { CreateUserRequestDto } from '@modules/user/shared/dtos/create-user-request.dto';
import { UpdateUserRequestDto } from '@modules/user/shared/dtos/update-user-request.dto';

import {
  USER_CREATE_USE_CASE_PROVIDE,
  FIND_USER_BY_ID_USE_CASE_PROVIDE,
  FIND_USER_BY_KEYCLOAK_ID_USE_CASE_PROVIDE,
  UPDATE_USER_USE_CASE_PROVIDE,
  DELETE_USER_USE_CASE_PROVIDE,
} from './user.token';

@Injectable()
export class UserService implements UserServiceInterface {
  constructor(
    @Inject(USER_CREATE_USE_CASE_PROVIDE)
    private readonly userCreateUseCase: UserCreateUseCaseInterface,
    @Inject(FIND_USER_BY_ID_USE_CASE_PROVIDE)
    private readonly findUserByIdUseCase: FindUserByIdUseCaseInterface,
    @Inject(FIND_USER_BY_KEYCLOAK_ID_USE_CASE_PROVIDE)
    private readonly findUserByKeycloakIdUseCase: FindUserByKeycloakIdUseCaseInterface,
    @Inject(UPDATE_USER_USE_CASE_PROVIDE)
    private readonly updateUserUseCase: UpdateUserUseCaseInterface,
    @Inject(DELETE_USER_USE_CASE_PROVIDE)
    private readonly deleteUserUseCase: DeleteUserUseCaseInterface,
  ) {}

  async createUser(dto: CreateUserRequestDto): Promise<UserServiceResponse> {
    return this.userCreateUseCase.execute(dto);
  }

  async findById(id: string): Promise<User | null> {
    return this.findUserByIdUseCase.execute(id);
  }

  async findByKeycloakId(keycloakId: string): Promise<User | null> {
    return this.findUserByKeycloakIdUseCase.execute(keycloakId);
  }

  async update(id: string, dto: UpdateUserRequestDto): Promise<User> {
    return this.updateUserUseCase.execute(id, dto);
  }

  async delete(id: string): Promise<void> {
    return this.deleteUserUseCase.execute(id);
  }
}
