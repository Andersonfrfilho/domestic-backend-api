import { Company, CompanyStatus } from '@app/modules/shared/providers/database/entities/company.entity';
import { CompanyMember, CompanyMemberRole, CompanyMemberStatus } from '@app/modules/shared/providers/database/entities/company-member.entity';

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
}
