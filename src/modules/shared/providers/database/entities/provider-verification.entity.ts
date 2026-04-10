import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { ProviderProfile } from './provider-profile.entity';

@Entity('provider_verifications')
export class ProviderVerification {
  @ApiProperty({ example: 'uuid-da-verificacao' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'uuid-do-prestador' })
  @Column({ name: 'provider_id' })
  providerId: string;

  @ApiProperty({ example: 'UNDER_REVIEW', enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] })
  @Column({ comment: 'PENDING, UNDER_REVIEW, APPROVED, REJECTED' })
  status: string;

  @CreateDateColumn({ name: 'submitted_at', type: 'timestamp' })
  submittedAt: Date;

  @ApiPropertyOptional({ example: '2026-04-05T14:00:00Z', nullable: true })
  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @ApiPropertyOptional({ example: 'uuid-do-admin', nullable: true })
  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true, comment: 'ID do admin (Keycloak ou interno)' })
  reviewedBy: string;

  @ApiPropertyOptional({ example: 'Documentos incompletos', nullable: true })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @ManyToOne(() => ProviderProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;
}
