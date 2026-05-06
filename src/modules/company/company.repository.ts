import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Company, CompanyStatus } from '@app/modules/shared/providers/database/entities/company.entity';
import { CompanyMember, CompanyMemberRole, CompanyMemberStatus } from '@app/modules/shared/providers/database/entities/company-member.entity';
import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';

import { CompanyRepositoryInterface } from './company.repository.interface';

@Injectable()
export class CompanyRepository implements CompanyRepositoryInterface {
  constructor(
    @InjectRepository(Company, CONNECTIONS_NAMES.POSTGRES)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(CompanyMember, CONNECTIONS_NAMES.POSTGRES)
    private readonly memberRepo: Repository<CompanyMember>,
  ) {}

  async create(data: {
    document: string;
    companyName: string;
    tradeName?: string | null;
    email: string;
    phone: string;
    stateRegistration?: string | null;
    municipalRegistration?: string | null;
    status?: CompanyStatus;
  }): Promise<Company> {
    const company = this.companyRepo.create({
      document: data.document,
      companyName: data.companyName,
      tradeName: data.tradeName ?? null,
      email: data.email,
      phone: data.phone,
      stateRegistration: data.stateRegistration ?? null,
      municipalRegistration: data.municipalRegistration ?? null,
      status: data.status ?? CompanyStatus.PENDING,
    });
    return this.companyRepo.save(company);
  }

  async findByDocument(document: string): Promise<Company | null> {
    return this.companyRepo.findOne({ where: { document } });
  }

  async findById(id: string): Promise<Company | null> {
    return this.companyRepo.findOne({ where: { id } });
  }

  async createMember(data: {
    companyId: string;
    userId: string;
    role: CompanyMemberRole;
    status?: CompanyMemberStatus;
  }): Promise<CompanyMember> {
    const member = this.memberRepo.create({
      companyId: data.companyId,
      userId: data.userId,
      role: data.role,
      status: data.status ?? CompanyMemberStatus.ACTIVE,
    });
    return this.memberRepo.save(member);
  }

  async findMembersByCompanyId(companyId: string): Promise<CompanyMember[]> {
    return this.memberRepo.find({ where: { companyId } });
  }

  async findUserCompanies(userId: string): Promise<Company[]> {
    const members = await this.memberRepo.find({
      where: { userId },
      relations: ['company'],
    });
    return members.map((m) => m.company);
  }
}
