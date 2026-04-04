import { User } from '@app/modules/shared/providers/database/entities/user.entity';

export interface UserCreateUseCaseParams {
  fullName: string;
  keycloakId?: string;
  status?: string;
}

export interface UserCreateUseCaseResponse extends User {}

export interface UserCreateUseCaseInterface {
  execute(dto: UserCreateUseCaseParams): Promise<UserCreateUseCaseResponse>;
}

export interface UserServiceParams {
  fullName: string;
  keycloakId?: string;
  status?: string;
}

export interface UserServiceResponse extends User {}

export interface UserServiceInterface {
  createUser(dto: UserServiceParams): Promise<UserServiceResponse>;
  getUserById(id: string): Promise<UserServiceResponse>;
  getUserByKeycloakId(keycloakId: string): Promise<UserServiceResponse>;
  updateUser(id: string, params: { fullName?: string; status?: string }): Promise<UserServiceResponse>;
  deleteUser(id: string): Promise<void>;
}
