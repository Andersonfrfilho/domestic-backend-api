import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TermsVersion } from '@modules/shared/providers/database/entities/terms-version.entity';

@Injectable()
export class TermsVersionRepository {
  constructor(
    @InjectRepository(TermsVersion)
    private readonly repo: Repository<TermsVersion>,
  ) {}

  async findActiveVersion(): Promise<TermsVersion | null> {
    return this.repo
      .createQueryBuilder('tv')
      .where('tv.is_active = true')
      .orderBy('tv.effective_date', 'DESC')
      .getOne();
  }

  async findAll(): Promise<TermsVersion[]> {
    return this.repo
      .createQueryBuilder('tv')
      .orderBy('tv.effective_date', 'DESC')
      .getMany();
  }

  async findByVersion(version: string): Promise<TermsVersion | null> {
    return this.repo
      .createQueryBuilder('tv')
      .where('tv.version = :version', { version })
      .getOne();
  }

  async create(data: {
    version: string;
    title: string;
    contentUrl: string | null;
    effectiveDate: Date;
    isActive: boolean;
  }): Promise<TermsVersion> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async deactivateAll(): Promise<void> {
    await this.repo.update({}, { isActive: false });
  }

  async setActive(version: string): Promise<void> {
    await this.repo.update({ version }, { isActive: true });
  }
}
