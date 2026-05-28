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

import { ProviderProfile } from './provider-profile.entity';
import { Service } from './service.entity';

@Entity('provider_services')
export class ProviderService {
  @ApiProperty({ example: 'uuid-do-vinculo' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'uuid-do-prestador' })
  @Column({ name: 'provider_id' })
  providerId: string;

  @ApiProperty({ example: 'uuid-do-servico' })
  @Column({ name: 'service_id' })
  serviceId: string;

  @ApiPropertyOptional({ example: 150.0, description: 'Preço base cobrado pelo prestador' })
  @Column({ name: 'price_base', type: 'decimal', nullable: true })
  priceBase: number;

  @ApiPropertyOptional({ example: 'FIXED', description: 'Tipo de cobrança (HOUR, FIXED, etc.)' })
  @Column({ name: 'price_type', nullable: true })
  priceType: string;

  @ApiPropertyOptional({ example: 120, description: 'Duração estimada do serviço em minutos' })
  @Column({ name: 'estimated_duration_minutes', type: 'int', nullable: true })
  estimatedDurationMinutes: number | null;

  @ApiPropertyOptional({ example: 50.0, description: 'Preço por hora' })
  @Column({ name: 'price_per_hour', type: 'decimal', precision: 10, scale: 2, nullable: true })
  pricePerHour: number | null;

  @ApiPropertyOptional({ example: true, description: 'Se o serviço está ativo' })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => ProviderProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  @ManyToOne(() => Service, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Service;
}
