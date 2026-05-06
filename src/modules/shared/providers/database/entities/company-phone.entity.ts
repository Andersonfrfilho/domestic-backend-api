import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Company } from './company.entity';

export enum CompanyPhoneType {
  LANDLINE = 'landline',
  MOBILE = 'mobile',
  WHATSAPP = 'whatsapp',
  FAX = 'fax',
}

@Entity('company_phones')
export class CompanyPhone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({
    type: 'enum',
    enum: CompanyPhoneType,
    default: CompanyPhoneType.LANDLINE,
  })
  type: CompanyPhoneType;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;
}
