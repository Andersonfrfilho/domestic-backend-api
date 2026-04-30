import { Injectable, Inject } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { DATABASE_POSTGRES_SOURCE } from '@modules/shared/providers/database/database.token';
import { TermsVersion } from '@modules/shared/providers/database/entities/terms-version.entity';

@Injectable()
export class TermsVersionRepository {
  private typeormRepo: Repository<TermsVersion>;

  constructor(@Inject(DATABASE_POSTGRES_SOURCE) private dataSource: DataSource) {
    this.typeormRepo = this.dataSource.getRepository(TermsVersion);
  }

  async findActiveVersion(): Promise<TermsVersion | null> {
    return this.typeormRepo
      .createQueryBuilder('tv')
      .where('tv.is_active = true')
      .orderBy('tv.effective_date', 'DESC')
      .getOne();
  }

  async findAll(): Promise<TermsVersion[]> {
    return this.typeormRepo
      .createQueryBuilder('tv')
      .orderBy('tv.effective_date', 'DESC')
      .getMany();
  }

  async findByVersion(version: string): Promise<TermsVersion | null> {
    return this.typeormRepo
      .createQueryBuilder('tv')
      .where('tv.version = :version', { version })
      .getOne();
  }

  async findById(id: string): Promise<TermsVersion | null> {
    return this.typeormRepo
      .createQueryBuilder('tv')
      .where('tv.id = :id', { id })
      .getOne();
  }

  async create(data: {
    version: string;
    title: string;
    contentUrl: string | null;
    effectiveDate: Date;
    isActive: boolean;
  }): Promise<TermsVersion> {
    const entity = this.typeormRepo.create(data);
    return this.typeormRepo.save(entity);
  }

  async deactivateAll(): Promise<void> {
    await this.typeormRepo.update({}, { isActive: false });
  }

  async setActive(version: string): Promise<void> {
    await this.typeormRepo.update({ version }, { isActive: true });
  }
}
