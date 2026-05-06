import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Company, CompanyStatus } from '@app/modules/shared/providers/database/entities/company.entity';
import { CompanyAddress, CompanyAddressType } from '@app/modules/shared/providers/database/entities/company-address.entity';
import { CompanyBusinessHours } from '@app/modules/shared/providers/database/entities/company-business-hours.entity';
import { CompanyEmail, CompanyEmailType } from '@app/modules/shared/providers/database/entities/company-email.entity';
import { CompanyMember, CompanyMemberRole, CompanyMemberStatus } from '@app/modules/shared/providers/database/entities/company-member.entity';
import { CompanyPhone, CompanyPhoneType } from '@app/modules/shared/providers/database/entities/company-phone.entity';
import { CompanyProvider, CompanyProviderRole, CompanyProviderStatus } from '@app/modules/shared/providers/database/entities/company-provider.entity';
import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';

import { CompanyRepositoryInterface } from './company.repository.interface';

@Injectable()
export class CompanyRepository implements CompanyRepositoryInterface {
  constructor(
    @InjectRepository(Company, CONNECTIONS_NAMES.POSTGRES)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(CompanyMember, CONNECTIONS_NAMES.POSTGRES)
    private readonly memberRepo: Repository<CompanyMember>,
    @InjectRepository(CompanyAddress, CONNECTIONS_NAMES.POSTGRES)
    private readonly addressRepo: Repository<CompanyAddress>,
    @InjectRepository(CompanyEmail, CONNECTIONS_NAMES.POSTGRES)
    private readonly emailRepo: Repository<CompanyEmail>,
    @InjectRepository(CompanyPhone, CONNECTIONS_NAMES.POSTGRES)
    private readonly phoneRepo: Repository<CompanyPhone>,
    @InjectRepository(CompanyBusinessHours, CONNECTIONS_NAMES.POSTGRES)
    private readonly businessHoursRepo: Repository<CompanyBusinessHours>,
    @InjectRepository(CompanyProvider, CONNECTIONS_NAMES.POSTGRES)
    private readonly providerRepo: Repository<CompanyProvider>,
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

  // Company Addresses
  async createAddress(data: {
    companyId: string;
    type: CompanyAddressType;
    zipCode: string;
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
    country?: string;
    latitude?: number | null;
    longitude?: number | null;
    isDefault?: boolean;
  }): Promise<CompanyAddress> {
    const address = this.addressRepo.create({
      companyId: data.companyId,
      type: data.type,
      zipCode: data.zipCode,
      street: data.street,
      number: data.number,
      complement: data.complement ?? null,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      country: data.country ?? 'BR',
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      isDefault: data.isDefault ?? true,
    });
    return this.addressRepo.save(address);
  }

  async findAddressesByCompanyId(companyId: string): Promise<CompanyAddress[]> {
    return this.addressRepo.find({ where: { companyId } });
  }

  // Company Emails
  async createEmail(data: {
    companyId: string;
    email: string;
    type?: CompanyEmailType;
    isDefault?: boolean;
  }): Promise<CompanyEmail> {
    const email = this.emailRepo.create({
      companyId: data.companyId,
      email: data.email,
      type: data.type ?? CompanyEmailType.GENERAL,
      isDefault: data.isDefault ?? false,
    });
    return this.emailRepo.save(email);
  }

  async findEmailsByCompanyId(companyId: string): Promise<CompanyEmail[]> {
    return this.emailRepo.find({ where: { companyId } });
  }

  // Company Phones
  async createPhone(data: {
    companyId: string;
    phone: string;
    type?: CompanyPhoneType;
    isDefault?: boolean;
  }): Promise<CompanyPhone> {
    const phone = this.phoneRepo.create({
      companyId: data.companyId,
      phone: data.phone,
      type: data.type ?? CompanyPhoneType.LANDLINE,
      isDefault: data.isDefault ?? false,
    });
    return this.phoneRepo.save(phone);
  }

  async findPhonesByCompanyId(companyId: string): Promise<CompanyPhone[]> {
    return this.phoneRepo.find({ where: { companyId } });
  }

  // Company Business Hours
  async createBusinessHours(data: {
    companyId: string;
    dayOfWeek: number;
    isOpen?: boolean;
    openTime?: string | null;
    closeTime?: string | null;
  }): Promise<CompanyBusinessHours> {
    const bh = this.businessHoursRepo.create({
      companyId: data.companyId,
      dayOfWeek: data.dayOfWeek,
      isOpen: data.isOpen ?? true,
      openTime: data.openTime ?? null,
      closeTime: data.closeTime ?? null,
    });
    return this.businessHoursRepo.save(bh);
  }

  async findBusinessHoursByCompanyId(companyId: string): Promise<CompanyBusinessHours[]> {
    return this.businessHoursRepo.find({ where: { companyId }, order: { dayOfWeek: 'ASC' } });
  }

  // Company Providers
  async createProvider(data: {
    companyId: string;
    providerId: string;
    role?: CompanyProviderRole;
    commissionRate?: number | null;
    fixedSalary?: number | null;
    status?: CompanyProviderStatus;
  }): Promise<CompanyProvider> {
    const provider = this.providerRepo.create({
      companyId: data.companyId,
      providerId: data.providerId,
      role: data.role ?? CompanyProviderRole.EMPLOYEE,
      commissionRate: data.commissionRate ?? null,
      fixedSalary: data.fixedSalary ?? null,
      status: data.status ?? CompanyProviderStatus.PENDING,
    });
    return this.providerRepo.save(provider);
  }

  async findProvidersByCompanyId(companyId: string): Promise<CompanyProvider[]> {
    return this.providerRepo.find({ where: { companyId } });
  }
}
