import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { UserPhone } from '@modules/shared/providers/database/entities/user-phone.entity';

import { CreateUserPhoneParams, UserPhoneRepositoryInterface } from '../user-phone.repository.interface';

@Injectable()
export class UserPhoneRepository implements UserPhoneRepositoryInterface {
  constructor(
    @InjectRepository(UserPhone, CONNECTIONS_NAMES.POSTGRES)
    private readonly typeormRepo: Repository<UserPhone>,
  ) {}

  async create(params: CreateUserPhoneParams): Promise<UserPhone> {
    const userPhone = this.typeormRepo.create(params);
    return this.typeormRepo.save(userPhone);
  }

  async findById(id: string): Promise<UserPhone | null> {
    return this.typeormRepo.findOne({
      where: { id },
      relations: ['phone'],
    });
  }

  async findByUserId(userId: string): Promise<UserPhone[]> {
    return this.typeormRepo.find({
      where: { userId },
      relations: ['phone'],
    });
  }

  async findByUserIdAndPhoneId(userId: string, phoneId: string): Promise<UserPhone | null> {
    return this.typeormRepo.findOne({ where: { userId, phoneId } });
  }

  async delete(id: string): Promise<void> {
    await this.typeormRepo.delete(id);
  }
}
