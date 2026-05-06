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

export enum CompanyAddressType {
  HEADQUARTERS = 'headquarters',
  BRANCH = 'branch',
  BILLING = 'billing',
  DELIVERY = 'delivery',
}

@Entity('company_addresses')
@Unique('company_addresses_headquarters_unique', ['companyId', 'type'])
export class CompanyAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({
    type: 'enum',
    enum: CompanyAddressType,
    default: CompanyAddressType.HEADQUARTERS,
  })
  type: CompanyAddressType;

  @Column({ name: 'zip_code', type: 'varchar', length: 10 })
  zipCode: string;

  @Column({ type: 'varchar', length: 255 })
  street: string;

  @Column({ type: 'varchar', length: 20 })
  number: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  complement: string | null;

  @Column({ type: 'varchar', length: 100 })
  neighborhood: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 2 })
  state: string;

  @Column({ type: 'varchar', length: 2, default: 'BR' })
  country: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number | null;

  @Column({ name: 'is_default', type: 'boolean', default: true })
  isDefault: boolean;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;
}
