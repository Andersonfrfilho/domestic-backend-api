import { Inject, Injectable } from '@nestjs/common';

import { DeleteUserUseCaseInterface } from '@modules/user/application/interfaces/user.interface';
import type { UserRepositoryInterface } from '@modules/user/domain/repositories/user.repository.interface';
import { USER_REPOSITORY_PROVIDE } from '@modules/user/infrastructure/user.token';

@Injectable()
export class DeleteUserUseCase implements DeleteUserUseCaseInterface {
  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(id: string): Promise<void> {
    return this.userRepository.delete(id);
  }
}
