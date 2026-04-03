import { Inject, Injectable } from '@nestjs/common';

import {
  type UserCreateUseCaseInterface,
  UserServiceInterface,
  UserServiceParams,
  UserServiceResponse,
} from './use-cases/create-users/create-user.interface';
import { USER_CREATE_USE_CASE_PROVIDE } from './user.token';

@Injectable()
export class UserService implements UserServiceInterface {
  constructor(
    @Inject(USER_CREATE_USE_CASE_PROVIDE)
    private readonly userCreateUseCase: UserCreateUseCaseInterface,
  ) {}
  async createUser(params: UserServiceParams): Promise<UserServiceResponse> {
    return this.userCreateUseCase.execute(params);
  }
}
