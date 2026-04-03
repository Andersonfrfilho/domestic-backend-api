import { User } from '@modules/shared/domain/entities/user.entity';
import { CreateUserRequestDto } from '@modules/user/shared/dtos/create-user-request.dto';
import { UpdateUserRequestDto } from '@modules/user/shared/dtos/update-user-request.dto';

export interface UserRepositoryInterface {
  create(user: CreateUserRequestDto): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByKeycloakId(keycloakId: string): Promise<User | null>;
  update(id: string, user: UpdateUserRequestDto): Promise<User>;
  delete(id: string): Promise<void>;
}
