import { Injectable, Inject } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { DATABASE_POSTGRES_SOURCE } from '@modules/shared/providers/database/database.token';
import { VerificationCode } from '@modules/shared/providers/database/entities/verification-code.entity';

@Injectable()
export class VerificationCodeRepository {
  private typeormRepo: Repository<VerificationCode>;

  constructor(@Inject(DATABASE_POSTGRES_SOURCE) private dataSource: DataSource) {
    this.typeormRepo = this.dataSource.getRepository(VerificationCode);
  }

  async create(data: {
    destination: string;
    type: 'email' | 'phone';
    code: string;
    expiresAt: Date;
  }): Promise<VerificationCode> {
    const entity = this.typeormRepo.create(data);
    return this.typeormRepo.save(entity);
  }

  async findActiveCode(destination: string, type: 'email' | 'phone'): Promise<VerificationCode | null> {
    return this.typeormRepo
      .createQueryBuilder('vc')
      .where('vc.destination = :destination', { destination })
      .andWhere('vc.type = :type', { type })
      .andWhere('vc.is_used = false')
      .andWhere('vc.expires_at > NOW()')
      .orderBy('vc.created_at', 'DESC')
      .getOne();
  }

  async markAsUsed(id: string): Promise<void> {
    await this.typeormRepo.update(id, { isUsed: true, verifiedAt: new Date() });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.typeormRepo
      .createQueryBuilder()
      .delete()
      .where('expires_at < NOW()')
      .execute();
    return result.affected ?? 0;
  }
}
