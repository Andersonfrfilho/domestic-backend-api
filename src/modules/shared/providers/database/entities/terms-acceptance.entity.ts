import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TermsVersion } from './terms-version.entity';

@Entity('terms_acceptances')
export class TermsAcceptance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => TermsVersion, { eager: true })
  @JoinColumn({ name: 'terms_version_id' })
  termsVersion: TermsVersion;

  @Column({ name: 'accepted_at', type: 'timestamp' })
  acceptedAt: Date;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
