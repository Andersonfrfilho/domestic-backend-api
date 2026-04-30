import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TermsAcceptance } from '@modules/shared/providers/database/entities/terms-acceptance.entity';

@Injectable()
export class TermsAcceptanceRepository {
  constructor(
    @InjectRepository(TermsAcceptance)
    private readonly repo: Repository<TermsAcceptance>,
  ) {}

  async create(data: {
    userId: string;
    termsVersionId: string;
    acceptedAt: Date;
    ipAddress: string | null;
  }): Promise<TermsAcceptance> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async findByUserId(userId: string): Promise<TermsAcceptance[]> {
    return this.repo
      .createQueryBuilder('ta')
      .leftJoinAndSelect('ta.termsVersion', 'tv')
      .where('ta.user_id = :userId', { userId })
      .orderBy('ta.accepted_at', 'DESC')
      .getMany();
  }

  async findLatestByUserId(userId: string): Promise<TermsAcceptance | null> {
    return this.repo
      .createQueryBuilder('ta')
      .leftJoinAndSelect('ta.termsVersion', 'tv')
      .where('ta.user_id = :userId', { userId })
      .orderBy('ta.accepted_at', 'DESC')
      .getOne();
  }

  async hasAcceptedVersion(userId: string, termsVersionId: string): Promise<boolean> {
    const count = await this.repo
      .createQueryBuilder('ta')
      .where('ta.user_id = :userId', { userId })
      .andWhere('ta.terms_version_id = :termsVersionId', { termsVersionId })
      .getCount();

    return count > 0;
  }
}
