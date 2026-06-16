import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ProviderProfile } from './provider-profile.entity';

@Entity('provider_availability')
export class ProviderAvailability {
  @ApiProperty({ example: 'uuid-do-horario' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'uuid-do-prestador' })
  @Column({ name: 'provider_id' })
  providerId: string;

  @ApiProperty({ example: 1, description: 'Day of week (0=Sunday, 6=Saturday)' })
  @Column({ name: 'day_of_week', type: 'smallint' })
  dayOfWeek: number;

  @ApiProperty({ example: '08:00' })
  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @ApiProperty({ example: '18:00' })
  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @ApiProperty({ example: true })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({
    example: 0,
    description: 'Surcharge percentage for this time slot (e.g. 50 = 50% extra)',
  })
  @Column({ name: 'additional_percentage', type: 'smallint', default: 0 })
  additionalPercentage: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @ManyToOne(() => ProviderProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;
}
