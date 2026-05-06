import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CompanyMember } from './company-member.entity';

export enum CompanyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  @Index('companies_document_idx')
  document: string;

  @Column({ name: 'company_name', type: 'varchar', length: 255 })
  @Index('companies_company_name_idx')
  companyName: string;

  @Column({ name: 'trade_name', type: 'varchar', length: 255, nullable: true })
  @Index('companies_trade_name_idx')
  tradeName: string | null;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ name: 'state_registration', type: 'varchar', length: 20, nullable: true })
  stateRegistration: string | null;

  @Column({ name: 'municipal_registration', type: 'varchar', length: 20, nullable: true })
  municipalRegistration: string | null;

  @Column({
    type: 'enum',
    enum: CompanyStatus,
    default: CompanyStatus.PENDING,
  })
  @Index('companies_status_idx')
  status: CompanyStatus;

  @OneToMany(() => CompanyMember, (member) => member.company)
  members: CompanyMember[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;
}
