import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Company } from './company.entity';

export enum CompanyProviderRole {
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  FREELANCER = 'freelancer',
}

export enum CompanyProviderStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

@Entity('company_providers')
@Unique('company_providers_company_provider_unique', ['companyId', 'providerId'])
@Check('commission_rate_check', 'commission_rate >= 0 AND commission_rate <= 100')
export class CompanyProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'provider_id', type: 'uuid' })
  providerId: string;

  @Column({
    type: 'enum',
    enum: CompanyProviderRole,
    default: CompanyProviderRole.EMPLOYEE,
  })
  role: CompanyProviderRole;

  @Column({ name: 'commission_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  commissionRate: number | null;

  @Column({ name: 'fixed_salary', type: 'decimal', precision: 10, scale: 2, nullable: true })
  fixedSalary: number | null;

  @Column({
    type: 'enum',
    enum: CompanyProviderStatus,
    default: CompanyProviderStatus.PENDING,
  })
  status: CompanyProviderStatus;

  @Column({ name: 'assigned_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;
}
