import { Inject, Injectable } from '@nestjs/common';

import { UserErrorFactory } from '@modules/user/application/factories';
import type {
  UserCreateUseCaseInterface,
  UserCreateUseCaseResponse,
} from '@modules/user/application/interfaces/user.interface';
import type { UserRepositoryInterface } from '@modules/user/domain/repositories/user.repository.interface';
import { USER_REPOSITORY_PROVIDE } from '@modules/user/infrastructure/user.token';
import { CreateUserRequestDto } from '@modules/user/shared/dtos/create-user-request.dto';

@Injectable()
export class UserApplicationCreateUseCase implements UserCreateUseCaseInterface {
  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(dto: CreateUserRequestDto): Promise<UserCreateUseCaseResponse> {
    // Validate keycloak_id uniqueness if provided
    if (dto.keycloakId) {
      const existingUser = await this.userRepository.findByKeycloakId(dto.keycloakId);
      if (existingUser) {
        throw UserErrorFactory.duplicateKeycloakId(dto.keycloakId);
      }
    }

    const user = await this.userRepository.create(dto);

    return user;
  }
}
