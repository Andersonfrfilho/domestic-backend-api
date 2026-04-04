import { Inject, Injectable } from '@nestjs/common';

import { type DeleteUserUseCaseInterface } from './use-cases/delete-user/delete-user.interface';
import { type GetUserByIdUseCaseInterface } from './use-cases/get-user-by-id/get-user-by-id.interface';
import { type GetUserByKeycloakIdUseCaseInterface } from './use-cases/get-user-by-keycloak-id/get-user-by-keycloak-id.interface';
import { type UpdateUserUseCaseInterface } from './use-cases/update-user/update-user.interface';
import {
  type UserCreateUseCaseInterface,
  UserServiceInterface,
  UserServiceParams,
  UserServiceResponse,
} from './use-cases/create-users/create-user.interface';
import {
  USER_CREATE_USE_CASE_PROVIDE,
  USER_DELETE_USE_CASE_PROVIDE,
  USER_GET_BY_ID_USE_CASE_PROVIDE,
  USER_GET_BY_KEYCLOAK_ID_USE_CASE_PROVIDE,
  USER_UPDATE_USE_CASE_PROVIDE,
} from './user.token';

@Injectable()
export class UserService implements UserServiceInterface {
  constructor(
    @Inject(USER_CREATE_USE_CASE_PROVIDE)
    private readonly userCreateUseCase: UserCreateUseCaseInterface,
    @Inject(USER_GET_BY_ID_USE_CASE_PROVIDE)
    private readonly getUserByIdUseCase: GetUserByIdUseCaseInterface,
    @Inject(USER_GET_BY_KEYCLOAK_ID_USE_CASE_PROVIDE)
    private readonly getUserByKeycloakIdUseCase: GetUserByKeycloakIdUseCaseInterface,
    @Inject(USER_UPDATE_USE_CASE_PROVIDE)
    private readonly updateUserUseCase: UpdateUserUseCaseInterface,
    @Inject(USER_DELETE_USE_CASE_PROVIDE)
    private readonly deleteUserUseCase: DeleteUserUseCaseInterface,
  ) {}

  async createUser(params: UserServiceParams): Promise<UserServiceResponse> {
    return this.userCreateUseCase.execute(params);
  }

  async getUserById(id: string): Promise<UserServiceResponse> {
    return this.getUserByIdUseCase.execute({ id });
  }

  async getUserByKeycloakId(keycloakId: string): Promise<UserServiceResponse> {
    return this.getUserByKeycloakIdUseCase.execute({ keycloakId });
  }

  async updateUser(id: string, params: { fullName?: string; status?: string }): Promise<UserServiceResponse> {
    return this.updateUserUseCase.execute({ id, ...params });
  }

  async deleteUser(id: string): Promise<void> {
    return this.deleteUserUseCase.execute({ id });
  }
}
