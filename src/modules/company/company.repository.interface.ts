import { Company, CompanyStatus } from '@app/modules/shared/providers/database/entities/company.entity';
import { CompanyAddress, CompanyAddressType } from '@app/modules/shared/providers/database/entities/company-address.entity';
import { CompanyBusinessHours } from '@app/modules/shared/providers/database/entities/company-business-hours.entity';
import { CompanyEmail, CompanyEmailType } from '@app/modules/shared/providers/database/entities/company-email.entity';
import { CompanyMember, CompanyMemberRole, CompanyMemberStatus } from '@app/modules/shared/providers/database/entities/company-member.entity';
import { CompanyPhone, CompanyPhoneType } from '@app/modules/shared/providers/database/entities/company-phone.entity';
import { CompanyProvider, CompanyProviderRole, CompanyProviderStatus } from '@app/modules/shared/providers/database/entities/company-provider.entity';

export interface CompanyRepositoryInterface {
  create(data: {
    document: string;
    companyName: string;
    tradeName?: string | null;
    email: string;
    phone: string;
    stateRegistration?: string | null;
    municipalRegistration?: string | null;
    status?: CompanyStatus;
  }): Promise<Company>;

  findByDocument(document: string): Promise<Company | null>;

  findById(id: string): Promise<Company | null>;

  createMember(data: {
    companyId: string;
    userId: string;
    role: CompanyMemberRole;
    status?: CompanyMemberStatus;
  }): Promise<CompanyMember>;

  findMembersByCompanyId(companyId: string): Promise<CompanyMember[]>;

  findUserCompanies(userId: string): Promise<Company[]>;

  // Company Addresses
  createAddress(data: {
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
  }): Promise<CompanyAddress>;

  findAddressesByCompanyId(companyId: string): Promise<CompanyAddress[]>;

  // Company Emails
  createEmail(data: {
    companyId: string;
    email: string;
    type?: CompanyEmailType;
    isDefault?: boolean;
  }): Promise<CompanyEmail>;

  findEmailsByCompanyId(companyId: string): Promise<CompanyEmail[]>;

  // Company Phones
  createPhone(data: {
    companyId: string;
    phone: string;
    type?: CompanyPhoneType;
    isDefault?: boolean;
  }): Promise<CompanyPhone>;

  findPhonesByCompanyId(companyId: string): Promise<CompanyPhone[]>;

  // Company Business Hours
  createBusinessHours(data: {
    companyId: string;
    dayOfWeek: number;
    isOpen?: boolean;
    openTime?: string | null;
    closeTime?: string | null;
  }): Promise<CompanyBusinessHours>;

  findBusinessHoursByCompanyId(companyId: string): Promise<CompanyBusinessHours[]>;

  // Company Providers
  createProvider(data: {
    companyId: string;
    providerId: string;
    role?: CompanyProviderRole;
    commissionRate?: number | null;
    fixedSalary?: number | null;
    status?: CompanyProviderStatus;
  }): Promise<CompanyProvider>;

  findProvidersByCompanyId(companyId: string): Promise<CompanyProvider[]>;
}
