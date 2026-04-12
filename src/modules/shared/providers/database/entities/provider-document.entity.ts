import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { ProviderProfile } from './provider-profile.entity';

@Entity('provider_documents')
export class ProviderDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'provider_id' })
  providerId: string;

  @Column({ name: 'document_type', comment: 'CPF, CNPJ, RG, LICENSE, etc' })
  documentType: string;

  @Column({ name: 'document_url' })
  documentUrl: string;

  @Column({ comment: 'PENDING, APPROVED, REJECTED' })
  status: string;

  @Column({ name: 'uploaded_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploadedAt: Date;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy: string;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => ProviderProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;
}
