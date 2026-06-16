import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity('documents')
export class Document {
  @ApiProperty({ example: 'uuid-do-documento' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'uuid-do-usuario' })
  @Column({ name: 'user_id' })
  userId: string;

  @ApiProperty({ example: 'CPF', description: 'Tipo do documento (ex: CPF, CNH, DIPLOMA)' })
  @Column({ name: 'document_type' })
  documentType: string;

  @ApiProperty({ example: 'documents/uuid/cpf.pdf', description: 'Caminho no bucket MinIO' })
  @Column({ name: 'document_url' })
  documentUrl: string;

  @ApiPropertyOptional({ example: '72246467098', nullable: true })
  @Column({ name: 'document_number', type: 'varchar', nullable: true })
  documentNumber: string | null;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  @Column()
  status: string;

  @ApiPropertyOptional({ example: '2026-04-05T14:00:00Z', nullable: true })
  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
