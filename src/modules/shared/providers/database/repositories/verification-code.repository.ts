import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VerificationCode } from '@modules/shared/providers/database/entities/verification-code.entity';

@Injectable()
export class VerificationCodeRepository {
  constructor(
    @InjectRepository(VerificationCode)
    private readonly repo: Repository<VerificationCode>,
  ) {}

  async create(data: {
    destination: string;
    type: 'email' | 'phone';
    code: string;
    expiresAt: Date;
  }): Promise<VerificationCode> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async findActiveCode(destination: string, type: 'email' | 'phone'): Promise<VerificationCode | null> {
    return this.repo
      .createQueryBuilder('vc')
      .where('vc.destination = :destination', { destination })
      .andWhere('vc.type = :type', { type })
      .andWhere('vc.is_used = false')
      .andWhere('vc.expires_at > NOW()')
      .orderBy('vc.created_at', 'DESC')
      .getOne();
  }

  async markAsUsed(id: string): Promise<void> {
    await this.repo.update(id, { isUsed: true, verifiedAt: new Date() });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.repo
      .createQueryBuilder()
      .delete()
      .where('expires_at < NOW()')
      .execute();
    return result.affected ?? 0;
  }
}
