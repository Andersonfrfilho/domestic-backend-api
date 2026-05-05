import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { Email } from '@modules/shared/providers/database/entities/email.entity';

import { CreateEmailParams, EmailRepositoryInterface } from '../email.repository.interface';
import { EmailErrorFactory } from '../factories/email.error.factory';

@Injectable()
export class EmailRepository implements EmailRepositoryInterface {
  constructor(
    @InjectRepository(Email, CONNECTIONS_NAMES.POSTGRES)
    private readonly typeormRepo: Repository<Email>,
  ) {}

  async create(params: CreateEmailParams): Promise<Email> {
    const email = this.typeormRepo.create(params);
    return this.typeormRepo.save(email);
  }

  async findById(id: string): Promise<Email | null> {
    return this.typeormRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<Email | null> {
    return this.typeormRepo.findOne({ where: { email } });
  }

  async update(id: string, params: Partial<Pick<Email, 'isVerified'>>): Promise<Email> {
    await this.typeormRepo.update(id, params);
    const updated = await this.typeormRepo.findOne({ where: { id } });
    if (!updated) {
      throw EmailErrorFactory.notFound(id);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.typeormRepo.delete(id);
  }
}
