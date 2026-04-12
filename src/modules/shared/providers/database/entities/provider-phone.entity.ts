import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Phone } from './phone.entity';
import { ProviderProfile } from './provider-profile.entity';

@Entity('provider_phones')
export class ProviderPhone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'provider_id' })
  providerId: string;

  @Column({ name: 'phone_id' })
  phoneId: string;

  @Column({ type: 'varchar', nullable: true })
  label: string | null;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => ProviderProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  @ManyToOne(() => Phone, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'phone_id' })
  phone: Phone;
}
