import { Inject, Injectable } from '@nestjs/common';

import { User } from '@modules/shared/domain/entities/user.entity';
import { UpdateUserUseCaseInterface } from '@modules/user/application/interfaces/user.interface';
import type { UserRepositoryInterface } from '@modules/user/domain/repositories/user.repository.interface';
import { USER_REPOSITORY_PROVIDE } from '@modules/user/infrastructure/user.token';
import { UpdateUserRequestDto } from '@modules/user/shared/dtos/update-user-request.dto';

@Injectable()
export class UpdateUserUseCase implements UpdateUserUseCaseInterface {
  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(id: string, dto: UpdateUserRequestDto): Promise<User> {
    return this.userRepository.update(id, dto);
  }
}
