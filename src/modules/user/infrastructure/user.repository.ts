import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CONNECTIONS_NAMES } from '@app/modules/shared/infrastructure/providers/database/database.constant';
import { User } from '@modules/shared/domain/entities/user.entity';
import { UserErrorFactory } from '@modules/user/application/factories';
import { UserRepositoryInterface } from '@modules/user/domain/repositories/user.repository.interface';
import { CreateUserRequestDto } from '@modules/user/shared/dtos/create-user-request.dto';
import { UpdateUserRequestDto } from '@modules/user/shared/dtos/update-user-request.dto';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(
    @InjectRepository(User, CONNECTIONS_NAMES.POSTGRES)
    private readonly typeormRepo: Repository<User>,
  ) {}

  async create(user: CreateUserRequestDto): Promise<User> {
    const newUser = this.typeormRepo.create(user);
    return this.typeormRepo.save(newUser);
  }

  async findById(id: string): Promise<User | null> {
    return this.typeormRepo.findOne({
      where: { id },
    });
  }

  async findByKeycloakId(keycloakId: string): Promise<User | null> {
    return this.typeormRepo.findOne({
      where: { keycloakId },
    });
  }

  async update(id: string, user: UpdateUserRequestDto): Promise<User> {
    await this.typeormRepo.update(id, user);
    const updatedUser = await this.typeormRepo.findOne({
      where: { id },
    });
    if (!updatedUser) {
      throw UserErrorFactory.notFound(id);
    }
    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    await this.typeormRepo.delete(id);
  }
}
