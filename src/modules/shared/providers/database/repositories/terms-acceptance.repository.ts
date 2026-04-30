import { Injectable, Inject } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { DATABASE_POSTGRES_SOURCE } from '@modules/shared/providers/database/database.token';
import { TermsAcceptance } from '@modules/shared/providers/database/entities/terms-acceptance.entity';

@Injectable()
export class TermsAcceptanceRepository {
  private typeormRepo: Repository<TermsAcceptance>;

  constructor(@Inject(DATABASE_POSTGRES_SOURCE) private dataSource: DataSource) {
    this.typeormRepo = this.dataSource.getRepository(TermsAcceptance);
  }

  async create(data: {
    userId: string;
    termsVersionId: string;
    acceptedAt: Date;
    ipAddress: string | null;
  }): Promise<TermsAcceptance> {
    const entity = this.typeormRepo.create({
      userId: data.userId,
      termsVersion: { id: data.termsVersionId } as TermsVersion,
      acceptedAt: data.acceptedAt,
      ipAddress: data.ipAddress,
    });
    return this.typeormRepo.save(entity);
  }

  async findByUserId(userId: string): Promise<TermsAcceptance[]> {
    return this.typeormRepo
      .createQueryBuilder('ta')
      .leftJoinAndSelect('ta.termsVersion', 'tv')
      .where('ta.user_id = :userId', { userId })
      .orderBy('ta.accepted_at', 'DESC')
      .getMany();
  }

  async findLatestByUserId(userId: string): Promise<TermsAcceptance | null> {
    return this.typeormRepo
      .createQueryBuilder('ta')
      .leftJoinAndSelect('ta.termsVersion', 'tv')
      .where('ta.user_id = :userId', { userId })
      .orderBy('ta.accepted_at', 'DESC')
      .getOne();
  }

  async hasAcceptedVersion(userId: string, termsVersionId: string): Promise<boolean> {
    const count = await this.typeormRepo
      .createQueryBuilder('ta')
      .where('ta.user_id = :userId', { userId })
      .andWhere('ta.terms_version_id = :termsVersionId', { termsVersionId })
      .getCount();

    return count > 0;
  }
}
