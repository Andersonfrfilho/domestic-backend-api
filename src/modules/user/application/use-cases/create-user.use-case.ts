import { Inject, Injectable } from '@nestjs/common';

import { UserErrorFactory } from '@modules/user/application/factories';
import type { UserRepositoryInterface } from '@modules/user/domain/repositories/user.repository.interface';
import { USER_REPOSITORY_PROVIDE } from '@modules/user/infrastructure/user.token';

import type {
  UserCreateUseCaseInterface,
  UserCreateUseCaseParams,
  UserCreateUseCaseResponse,
} from '../interfaces/create-user.interface';

@Injectable()
export class UserApplicationCreateUseCase implements UserCreateUseCaseInterface {
  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(params: UserCreateUseCaseParams): Promise<UserCreateUseCaseResponse> {
    // Validate keycloak_id uniqueness if provided
    if (params.keycloakId) {
      const existingUser = await this.userRepository.findByKeycloakId(params.keycloakId);
      if (existingUser) {
        throw UserErrorFactory.duplicateKeycloakId(params.keycloakId);
      }
    }

    const user = await this.userRepository.create({
      fullName: params.fullName,
      keycloakId: params.keycloakId,
      status: params.status,
    });

    return user;
  }
}
