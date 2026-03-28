import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from './user.entity';

@Entity('provider_profiles')
export class ProviderProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @Column({ name: 'business_name', nullable: true })
  businessName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'average_rating', type: 'decimal', default: 0 })
  averageRating: number;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
