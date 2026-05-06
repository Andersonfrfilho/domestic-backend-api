import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Company } from './company.entity';
import { User } from './user.entity';

export enum CompanyMemberRole {
  ADMIN = 'admin',
  PARTNER = 'partner',
  EMPLOYEE = 'employee',
}

export enum CompanyMemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

@Entity('company_members')
@Unique('company_members_company_user_unique', ['companyId', 'userId'])
export class CompanyMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: CompanyMemberRole,
    default: CompanyMemberRole.PARTNER,
  })
  role: CompanyMemberRole;

  @Column({
    type: 'enum',
    enum: CompanyMemberStatus,
    default: CompanyMemberStatus.ACTIVE,
  })
  status: CompanyMemberStatus;

  @Column({ name: 'joined_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date;

  @ManyToOne(() => Company, (company) => company.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;
}
