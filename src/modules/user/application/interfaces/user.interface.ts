import { User } from '@app/modules/shared/domain/entities/user.entity';
import { CreateUserRequestDto } from '@modules/user/shared/dtos/create-user-request.dto';
import { UpdateUserRequestDto } from '@modules/user/shared/dtos/update-user-request.dto';

export interface UserCreateUseCaseResponse extends User {}

export interface UserCreateUseCaseInterface {
  execute(dto: CreateUserRequestDto): Promise<UserCreateUseCaseResponse>;
}

export interface UserServiceResponse extends User {}

export interface UserServiceInterface {
  createUser(dto: CreateUserRequestDto): Promise<UserServiceResponse>;
  findById(id: string): Promise<User | null>;
  findByKeycloakId(keycloakId: string): Promise<User | null>;
  update(id: string, dto: UpdateUserRequestDto): Promise<User>;
  delete(id: string): Promise<void>;
}

export interface FindUserByIdUseCaseInterface {
  execute(id: string): Promise<User | null>;
}

export interface FindUserByKeycloakIdUseCaseInterface {
  execute(keycloakId: string): Promise<User | null>;
}

export interface UpdateUserUseCaseInterface {
  execute(id: string, dto: UpdateUserRequestDto): Promise<User>;
}

export interface DeleteUserUseCaseInterface {
  execute(id: string): Promise<void>;
}
