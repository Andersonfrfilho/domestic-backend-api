import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { Phone } from '@modules/shared/providers/database/entities/phone.entity';

import { PhoneErrorFactory } from '../factories/phone.error.factory';
import { CreatePhoneParams, PhoneRepositoryInterface } from '../phone.repository.interface';

@Injectable()
export class PhoneRepository implements PhoneRepositoryInterface {
  constructor(
    @InjectRepository(Phone, CONNECTIONS_NAMES.POSTGRES)
    private readonly typeormRepo: Repository<Phone>,
  ) {}

  async create(params: CreatePhoneParams): Promise<Phone> {
    const phone = this.typeormRepo.create(params);
    return this.typeormRepo.save(phone);
  }

  async findById(id: string): Promise<Phone | null> {
    return this.typeormRepo.findOne({ where: { id } });
  }

  async findByNumber(number: string): Promise<Phone | null> {
    return this.typeormRepo.findOne({ where: { number } });
  }

  async delete(id: string): Promise<void> {
    await this.typeormRepo.delete(id);
  }
}
