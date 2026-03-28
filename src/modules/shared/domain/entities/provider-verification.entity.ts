import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { ProviderProfile } from './provider-profile.entity';

@Entity('provider_verifications')
export class ProviderVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'provider_id' })
  providerId: string;

  @Column({ comment: 'PENDING, UNDER_REVIEW, APPROVED, REJECTED' })
  status: string;

  @Column({ name: 'submitted_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt: Date;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true, comment: 'ID do admin (Keycloak ou interno)' })
  reviewedBy: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => ProviderProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;
}
