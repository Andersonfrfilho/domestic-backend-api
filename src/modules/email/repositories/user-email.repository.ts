import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { UserEmail } from '@modules/shared/providers/database/entities/user-email.entity';

import { CreateUserEmailParams, UserEmailRepositoryInterface } from '../user-email.repository.interface';

@Injectable()
export class UserEmailRepository implements UserEmailRepositoryInterface {
  constructor(
    @InjectRepository(UserEmail, CONNECTIONS_NAMES.POSTGRES)
    private readonly typeormRepo: Repository<UserEmail>,
  ) {}

  async create(params: CreateUserEmailParams): Promise<UserEmail> {
    const userEmail = this.typeormRepo.create(params);
    return this.typeormRepo.save(userEmail);
  }

  async findById(id: string): Promise<UserEmail | null> {
    return this.typeormRepo.findOne({
      where: { id },
      relations: ['email'],
    });
  }

  async findByUserId(userId: string): Promise<UserEmail[]> {
    return this.typeormRepo.find({
      where: { userId },
      relations: ['email'],
    });
  }

  async findByUserIdAndEmailId(userId: string, emailId: string): Promise<UserEmail | null> {
    return this.typeormRepo.findOne({ where: { userId, emailId } });
  }

  async delete(id: string): Promise<void> {
    await this.typeormRepo.delete(id);
  }
}
