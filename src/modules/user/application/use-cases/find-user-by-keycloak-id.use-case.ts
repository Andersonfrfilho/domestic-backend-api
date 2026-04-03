import { Inject, Injectable } from '@nestjs/common';

import { User } from '@modules/shared/domain/entities/user.entity';
import { FindUserByKeycloakIdUseCaseInterface } from '@modules/user/application/interfaces/user.interface';
import type { UserRepositoryInterface } from '@modules/user/domain/repositories/user.repository.interface';
import { USER_REPOSITORY_PROVIDE } from '@modules/user/infrastructure/user.token';

@Injectable()
export class FindUserByKeycloakIdUseCase implements FindUserByKeycloakIdUseCaseInterface {
  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(keycloakId: string): Promise<User | null> {
    return this.userRepository.findByKeycloakId(keycloakId);
  }
}
